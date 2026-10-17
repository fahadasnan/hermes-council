"""
Django models for the customers app.

Customers are the end-users who enroll in a program and hold a pass.
Customer data is PII and tenant-scoped.
"""

import uuid
from django.db import models
from .tenants import Tenant, TenantScopedManager


class Customer(models.Model):
    """
    A customer enrolled in at least one program.

    Email and mobile are PII. A location-scoped staff member
    sees only first_name + last initial + pass status, not full PII.

    Soft-delete via is_deleted. GDPR erasure sets PII fields to NULL
    in addition to is_deleted=True.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='customers')
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    data = models.JSONField(
        default=dict,
        help_text='All enrollment fields as a JSON object',
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'customers'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['tenant', 'email'],
                name='idx_customer_tenant_email',
                condition=models.Q(is_deleted=False),
            ),
            models.Index(fields=['tenant', 'created_at']),
        ]

    def __str__(self):
        return f'{self.first_name} ({self.tenant.name})'

    def soft_delete(self):
        """Mark as deleted without removing the record."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def gdpr_erase(self):
        """Zero out PII fields and soft-delete."""
        self.first_name = ''
        self.last_name = ''
        self.email = None
        self.mobile = None
        self.data = {}
        self.soft_delete()


class CustomerEnrollment(models.Model):
    """
    Links a customer to a program they enrolled in.

    A customer can enroll in multiple programs (one per program).
    """

    class Method(models.TextChoices):
        LINK = 'link', 'Enrollment Link'
        QR = 'qr', 'QR Code'
        API = 'api', 'Tenant API'
        MANUAL = 'manual', 'Manual (dashboard)'

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    enrollment_method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.LINK,
    )

    class Meta:
        db_table = 'customer_enrollments'
        constraints = [
            models.UniqueConstraint(
                fields=['customer', 'program'],
                name='uq_enrollment_customer_program',
            ),
        ]

    def __str__(self):
        return f'{self.customer.first_name} in {self.program.name}'