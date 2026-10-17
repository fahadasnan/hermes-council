"""
Django models for the programs app.

Status (round 2, F-CONSISTENCY adjudication): illustrative draft, superseded per
ADR-44. The binding patterns live in decisions.md / CONVENTIONS.md and the
django-data / django-backend skills; Phase 0 rewrites these models from those
sources. Do not copy this code as-is.

Programs (loyalty programs), design, rewards, enrollment fields,
location and beacon assignments, useful links, custom labels,
and style-specific configuration tables.
"""

import uuid
from django.db import models
from .tenants import Tenant, Location, Beacon, TenantScopedManager


class Program(models.Model):
    """
    A loyalty program (campaign) that issues wallet passes.

    Shared fields across all pass styles. Style-specific fields
    live in separate 1:1 config tables (StoreCardConfig, CouponConfig, etc.).
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        ARCHIVED = 'archived', 'Archived'

    class PassStyle(models.TextChoices):
        STORE_CARD = 'store_card', 'Store Card'
        COUPON = 'coupon', 'Coupon'
        EVENT_TICKET = 'event_ticket', 'Event Ticket'
        BOARDING_PASS = 'boarding_pass', 'Boarding Pass'
        GENERIC = 'generic', 'Generic'

    class GoogleClass(models.TextChoices):
        LOYALTY = 'loyalty', 'Loyalty'
        GIFT_CARD = 'gift_card', 'Gift Card'
        OFFER = 'offer', 'Offer'
        EVENT_TICKET = 'event_ticket', 'Event Ticket'
        FLIGHT = 'flight', 'Flight'
        TRANSIT = 'transit', 'Transit'
        GENERIC = 'generic', 'Generic'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100)
    pass_style = models.CharField(max_length=30, choices=PassStyle.choices)
    google_class = models.CharField(max_length=30, choices=GoogleClass.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    # Common reward config (used by store_card; may be NULL for coupon/generic)
    stamps_required = models.PositiveIntegerField(null=True, blank=True)
    points_per_stamp = models.PositiveIntegerField(null=True, blank=True)

    # Currency: if NULL, inherits tenant.currency
    currency = models.CharField(max_length=3, null=True, blank=True)

    # Terms and consent
    terms_text = models.TextField(null=True, blank=True)
    terms_url = models.URLField(null=True, blank=True)
    consent_enabled = models.BooleanField(default=False)
    consent_text = models.TextField(null=True, blank=True)

    # Expiry
    class ExpiryType(models.TextChoices):
        NONE = 'none', 'No expiry'
        FIXED_DATE = 'fixed_date', 'Fixed date'
        FIXED_PERIOD = 'fixed_period', 'Fixed period after enrollment'

    expiry_type = models.CharField(
        max_length=20,
        choices=ExpiryType.choices,
        null=True,
        blank=True,
    )
    expiry_date = models.DateField(null=True, blank=True)
    expiry_period_days = models.PositiveIntegerField(null=True, blank=True)

    # Issuer details (Apple Wallet requirement)
    business_name = models.CharField(max_length=255, null=True, blank=True)
    business_email = models.EmailField(null=True, blank=True)
    business_phone = models.CharField(max_length=50, null=True, blank=True)

    # NFC (later phase, column ready)
    is_nfc_enabled = models.BooleanField(default=False)

    # Economics (set via Insights)
    stamp_value = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        null=True,
        blank=True,
        help_text='Revenue per stamp in the program currency',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    class Meta:
        db_table = 'programs'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'slug'],
                name='uq_program_tenant_slug',
            ),
        ]
        indexes = [
            models.Index(fields=['tenant', 'status']),
        ]

    def __str__(self):
        return f'{self.name} ({self.tenant.name})'


class ProgramDesign(models.Model):
    """Visual design of a program's wallet pass."""

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='design',
    )
    icon_image_key = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='S3 key for 87x87 icon',
    )
    logo_image_key = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='S3 key for logo',
    )
    strip_image_key = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='S3 key for hero/strip image',
    )
    background_color = models.CharField(
        max_length=7,
        null=True,
        blank=True,
        help_text='Hex color e.g. #123456',
    )
    text_color = models.CharField(max_length=7, null=True, blank=True)
    stamp_color = models.CharField(max_length=7, null=True, blank=True)
    unstamp_color = models.CharField(max_length=7, null=True, blank=True)
    stamp_circle_color = models.CharField(max_length=7, null=True, blank=True)

    class Meta:
        db_table = 'program_designs'


class Reward(models.Model):
    """A reward defined for a program."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='rewards',
    )
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    stamps_required = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Required for store_card; NULL for coupon/generic',
    )
    cost = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        null=True,
        blank=True,
        help_text='Monetary value of the reward',
    )
    stamp_message = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='Must contain {#} placeholder',
    )
    reward_message = models.CharField(max_length=500, null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'rewards'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.name} ({self.program.name})'


class EnrollmentField(models.Model):
    """A field collected during customer enrollment."""

    class FieldType(models.TextChoices):
        TEXT = 'text', 'Text'
        NUMBER = 'number', 'Number'
        DATE = 'date', 'Date'
        EMAIL = 'email', 'Email'
        URL = 'url', 'URL'
        MOBILE = 'mobile', 'Mobile'

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='enrollment_fields',
    )
    name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    is_required = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    is_unique = models.BooleanField(
        default=False,
        help_text='Premium: deduplicate enrollment on this field',
    )

    class Meta:
        db_table = 'enrollment_fields'
        ordering = ['sort_order']


class ProgramLocation(models.Model):
    """Assignment of a global location to a program."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='program_locations',
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='program_locations',
    )
    address_on_card = models.CharField(max_length=500, null=True, blank=True)
    show_on_card = models.BooleanField(default=True)
    lock_screen_message = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'program_locations'
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'location'],
                name='uq_program_location',
            ),
        ]


class ProgramBeacon(models.Model):
    """Assignment of a global beacon to a program. Later phase, column ready."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='program_beacons',
    )
    beacon = models.ForeignKey(
        Beacon,
        on_delete=models.CASCADE,
        related_name='program_beacons',
    )
    lock_screen_message = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'program_beacons'
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'beacon'],
                name='uq_program_beacon',
            ),
        ]


class UsefulLink(models.Model):
    """A useful link displayed on a wallet pass."""

    class LinkType(models.TextChoices):
        URL = 'url', 'URL'
        PHONE = 'phone', 'Phone'
        EMAIL = 'email', 'Email'
        ADDRESS = 'address', 'Address'

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='useful_links',
    )
    label = models.CharField(max_length=255)
    url = models.TextField()
    link_type = models.CharField(max_length=20, choices=LinkType.choices)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'useful_links'
        ordering = ['sort_order']


class CustomField(models.Model):
    """
    A custom label override for a program's pass strings.
    Premium feature.
    """

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='custom_fields',
    )
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=500)

    class Meta:
        db_table = 'custom_fields'
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'key'],
                name='uq_custom_field_program_key',
            ),
        ]


class StampImage(models.Model):
    """Stamp image pair (stamped / unstamped) for a program."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='stamp_images',
    )
    stamped_key = models.CharField(max_length=500, null=True, blank=True)
    unstamped_key = models.CharField(max_length=500, null=True, blank=True)
    preset_name = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'stamp_images'


# --- Style-specific config tables (1:1 with Program) ---

class StoreCardConfig(models.Model):
    """Configuration for store_card (stamps or points) programs."""

    class CardType(models.TextChoices):
        STAMPS = 'stamps', 'Stamps'
        POINTS = 'points', 'Points'

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='store_card_config',
    )
    card_type = models.CharField(max_length=20, choices=CardType.choices, default=CardType.STAMPS)
    stamps_required = models.PositiveIntegerField()
    points_balance_max = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Max points balance. NULL = unlimited.',
    )

    class Meta:
        db_table = 'store_card_configs'


class CouponConfig(models.Model):
    """Configuration for coupon programs."""

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='coupon_config',
    )
    single_use = models.BooleanField(default=True)

    class Meta:
        db_table = 'coupon_configs'


class EventTicketConfig(models.Model):
    """
    Configuration for event_ticket programs.
    Later phase, but the table is designed and ready.
    """

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='event_ticket_config',
    )
    event_name = models.CharField(max_length=255)
    venue_name = models.CharField(max_length=255, null=True, blank=True)
    venue_address = models.TextField(null=True, blank=True)
    event_start = models.DateTimeField(null=True, blank=True)
    event_end = models.DateTimeField(null=True, blank=True)
    seat_label_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'event_ticket_configs'


class BoardingPassConfig(models.Model):
    """
    Configuration for boarding_pass programs.
    Later phase, but the table is designed and ready.
    """

    class TransportType(models.TextChoices):
        FLIGHT = 'flight', 'Flight'
        TRAIN = 'train', 'Train'
        BUS = 'bus', 'Bus'
        FERRY = 'ferry', 'Ferry'

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='boarding_pass_config',
    )
    transport_type = models.CharField(max_length=20, choices=TransportType.choices)
    departure_station = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'boarding_pass_configs'


class PushMessage(models.Model):
    """A push message sent to passes of a program."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='push_messages',
    )
    message = models.TextField()
    segment_criteria = models.JSONField(
        null=True,
        blank=True,
        help_text='Segment filter as JSON, or NULL for all customers',
    )
    sent_by = models.ForeignKey(
        'tenants.Membership',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    reach_count = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'push_messages'
        ordering = ['-sent_at']


class ProgramSettings(models.Model):
    """Key-value settings for a program."""

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='settings',
    )
    key = models.CharField(max_length=100)
    value = models.JSONField()

    class Meta:
        db_table = 'program_settings'
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'key'],
                name='uq_program_setting_key',
            ),
        ]