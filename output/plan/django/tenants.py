"""
Django models for the tenants app.

Multi-tenant foundation: Tenant, Location, Membership, Beacon,
APICredential, WebhookSubscription, and the TenantScopedManager
base class that every tenant-owned model must use.
"""

import uuid
from django.conf import settings
from django.db import models
from django.db.models import QuerySet


class TenantNotSupplied(ValueError):
    """Raised when a tenant-owned model is created without a tenant."""


class TenantScopedManager(models.Manager):
    """
    Base manager for every model that belongs to a tenant.

    Usage:
        class MyModel(models.Model):
            tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
            objects = TenantScopedManager()

        # Scoped queryset:
        MyModel.objects.for_tenant(tenant)

        # Create with tenant enforced:
        MyModel.objects.create_for_tenant(tenant, name='...')

        # Unscoped (platform admin only):
        MyModel.objects.all_tenants()

    The default queryset filters to the tenant set by `set_current_tenant`.
    If no tenant is set, the default queryset is empty for reads and the
    create method raises TenantNotSupplied for writes.
    """
    _current_tenant = None

    @classmethod
    def set_current_tenant(cls, tenant):
        cls._current_tenant = tenant

    @classmethod
    def clear_current_tenant(cls):
        cls._current_tenant = None

    def get_queryset(self):
        qs = super().get_queryset()
        if self._current_tenant is not None:
            return qs.filter(tenant=self._current_tenant)
        # No tenant set: return empty queryset (safe default)
        return qs.none()

    def all_tenants(self):
        """Bypass tenant scoping (platform admin only)."""
        return super().get_queryset()

    def for_tenant(self, tenant):
        """Explicitly scope to a tenant."""
        return super().get_queryset().filter(tenant=tenant)

    def create(self, **kwargs):
        if 'tenant' not in kwargs and self._current_tenant is None:
            raise TenantNotSupplied(
                'tenant is required. Use create_for_tenant() or set_current_tenant().'
            )
        if 'tenant' not in kwargs:
            kwargs['tenant'] = self._current_tenant
        return super().create(**kwargs)

    def create_for_tenant(self, tenant, **kwargs):
        """Explicitly create a row for a given tenant."""
        kwargs['tenant'] = tenant
        return super().create(**kwargs)


class Tenant(models.Model):
    """A business that uses the platform."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    currency = models.CharField(
        max_length=3,
        default='KWD',
        help_text='ISO 4217 currency code',
    )
    timezone = models.CharField(
        max_length=50,
        default='Asia/Kuwait',
        help_text='IANA timezone string',
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        ordering = ['name']

    def __str__(self):
        return self.name


class Location(models.Model):
    """A physical location belonging to a tenant."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=255)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lon = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(default='')
    timezone = models.CharField(max_length=50, default='Asia/Kuwait')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'locations'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'name'],
                name='uq_location_tenant_name',
            ),
        ]

    def __str__(self):
        return f'{self.name} ({self.tenant.name})'


class Membership(models.Model):
    """
    Links a User to a Tenant with a role and optional location scope.

    A user can belong to multiple tenants (one Membership per tenant).
    The role determines what the user can do within that tenant.
    If `location` is set, the staff member is scoped to that location.
    """

    class Role(models.TextChoices):
        OWNER = 'owner', 'Tenant Owner'
        MANAGER = 'manager', 'Manager'
        STAFF = 'staff', 'Staff'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=Role.choices)
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_memberships',
        help_text='If set, scopes this membership to one location. NULL = all locations.',
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'memberships'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'tenant'],
                name='uq_membership_user_tenant',
            ),
        ]
        indexes = [
            models.Index(fields=['tenant', 'role']),
        ]

    def __str__(self):
        return f'{self.user.email} in {self.tenant.name} as {self.role}'


class Beacon(models.Model):
    """A BLE beacon belonging to a tenant, used for lock-screen messages."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='beacons')
    name = models.CharField(max_length=255)
    uuid = models.UUIDField()
    major = models.IntegerField()
    minor = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'beacons'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'uuid', 'major', 'minor'],
                name='uq_beacon_tenant_identity',
            ),
        ]

    def __str__(self):
        return f'{self.name} ({self.uuid})'


class APICredential(models.Model):
    """
    Credential for a store's POS or external system to call the tenant API.

    The secret is stored as a hash; the raw value is shown once at creation.
    """

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='api_credentials')
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=255, unique=True)
    secret_hash = models.CharField(max_length=255)
    scopes = models.JSONField(
        default=list,
        help_text='List of scopes: enroll, earn, redeem, void, read:balance',
    )
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'api_credentials'

    def __str__(self):
        return f'{self.name} ({self.tenant.name})'


class WebhookSubscription(models.Model):
    """
    A tenant's webhook endpoint for receiving event notifications.

    Events are signed with HMAC using the webhook secret.
    Failed deliveries are retried with exponential backoff.
    """

    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='webhook_subscriptions',
    )
    url = models.URLField(max_length=2048)
    secret = models.CharField(
        max_length=255,
        help_text='HMAC signing secret for webhook payloads',
    )
    events = models.JSONField(
        default=list,
        help_text='Event types to deliver: enroll, earn, redeem, void',
    )
    is_active = models.BooleanField(default=True)
    last_delivered_at = models.DateTimeField(null=True, blank=True)
    failed_count = models.IntegerField(
        default=0,
        help_text='Consecutive failures. Reset on success.',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'webhook_subscriptions'

    def __str__(self):
        return f'Webhook {self.tenant.name} -> {self.url}'