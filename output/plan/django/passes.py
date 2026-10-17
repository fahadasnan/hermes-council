"""
Django models for the passes app.

A Pass is a customer's wallet pass for a specific program.
It tracks the customer's balance (stamps or points) and the
external pass identifiers for Apple Wallet and Google Wallet.
"""

import uuid
from django.db import models
from .tenants import TenantScopedManager


class Pass(models.Model):
    """
    A customer's wallet pass for one program.

    One pass per customer per program. The balance fields
    (stamps_earned, points_balance) are denormalized from the
    ledger and updated atomically with each LedgerEntry.
    """

    class Status(models.TextChoices):
        ISSUED = 'issued', 'Issued'
        REDEEMED = 'redeemed', 'Redeemed'
        VOIDED = 'voided', 'Voided'
        EXPIRED = 'expired', 'Expired'

    class PushStatus(models.TextChoices):
        OK = 'ok', 'OK'
        PENDING = 'pending', 'Pending'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='passes',
    )
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.CASCADE,
        related_name='passes',
    )
    pass_style = models.CharField(max_length=30)

    # Apple Wallet identifiers
    apple_pass_type_id = models.CharField(max_length=255, null=True, blank=True)
    apple_pass_serial = models.CharField(max_length=255, null=True, blank=True)

    # Google Wallet identifiers
    google_class_id = models.CharField(max_length=255, null=True, blank=True)
    google_object_id = models.CharField(max_length=255, null=True, blank=True)

    # Denormalized balances (source of truth is the ledger)
    stamps_earned = models.PositiveIntegerField(default=0,
        help_text='Total stamps earned on this pass',
    )
    pointss_balance = models.P ositiveIntegerField(default=0,
        help_text='Current points balance',
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)

    # Push tracking
    last_pushed_at = models.DateTimeField(null=True, blank=True)
    push_status = models.CharField(
        max_length=20, choices=PushStatus.choices, null=True, blank=True,
    )
    push_er ror = models.TextField(null=True, blank=True)

    # Void
    voided_at = models.DateTimeField(null=True, blank=True)
    voided_reason = models.Char Field(max_l ength=500, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'passes'
        constraints = [
            models.Unique Constraint(
                fields=['customer', 'program'],
                name='uq_pass_customer_program',
            ),
        ]
        indexes = [
            models.Index(fields=['program', 'statu s']),
            models.Index(fields=['push_status'], condition=models.Q(push_status='failed')),
        ]

    def __str__(self):
        return f'{self.customer.first_name} - {self.program.name}'
