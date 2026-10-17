"""
Django models for the ledger app.

Status (round 2, F-CONSISTENCY adjudication): illustrative draft, superseded per
ADR-44. The binding patterns live in decisions.md / CONVENTIONS.md and the
django-data / django-backend skills; Phase 0 rewrites these models from those
sources. Do not copy this code as-is (known draft deviations: plain FKs instead
of composite same-tenant FKs via db_constraint=False + migration RunSQL; missing
append-only DB trigger and signed-delta checks defined in ADR-9).

The ledger is append-only. Every event that changes a pass balance
(earn, redeem, issue, void) creates an immutable LedgerEntry.
The Pass balance is the sum of the ledger, denormalized for fast reads.

Key invariants enforced by the LedgerService (not just the model):
- Balance can only change via a LedgerEntry.
- Idempotency: one event per (tenant, idempotency_key).
- Balance cannot go negative.
- A redeem cannot exceed available stamps/points.
"""

import uuid
from django.db import models
from django.db.models import UniqueConstraint
from .tenants import Tenant, Location, TenantScopedManager


class LedgerEntry(models.Model):
    """
    An append-only record of a balance-changing event.

    Never updated or deleted. Corrections are new entries.
    """

    class EventType(models.TextChoices):
        ENROLL = 'enroll', 'Enrollment'
        EARN = 'earn', 'Earn (stamps or points)'
        REDEEM = 'redeem', 'Redeem (reward)'
        ISSUE = 'issue', 'Issue (coupon/generic pass)'
        VOID = 'void', 'Void (invalidate a pass)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='ledger_entries')
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='ledger_entries',
    )
    pass_field = models.ForeignKey(
        'passes.Pass',
        on_delete=models.CASCADE,
        related_name='ledger_entries',
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries',
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    quantity = models.PositiveIntegerField(
        help_text='Always positive; event_type determines direction',
    )
    previous_balance = models.IntegerField(
        help_text='Balance before this entry (for audit)',
    )
    new_balance = models.PositiveIntegerField(
        help_text='Balance after this entry; must be >= 0',
    )
    idempotency_key = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, help_text='Free-form data attached to the event')
    created_by = models.ForeignKey(
        'tenants.Membership',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_entries',
    )
    created_by_api = models.BooleanField(
        default=False,
        help_text='True when created via tenant API',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ledger_entries'
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                fields=['tenant', 'idempotency_key'],
                name='uq_ledger_idempotency',
            ),
            models.CheckConstraint(
                check=models.Q(new_balance__gte=0),
                name='ck_ledger_new_balance_nonnegative',
            ),
        ]
        indexes = [
            models.Index(fields=['pass_field', 'created_at']),
            models.Index(fields=['tenant', 'created_at']),
            models.Index(fields=['customer', 'created_at']),
        ]

    def __str__(self):
        return f'{self.event_type} x{self.quantity} for {self.customer}'
