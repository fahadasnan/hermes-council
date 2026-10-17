"""
Django models for the passes app.

Status (round 2, F-CONSISTENCY adjudication): illustrative draft, superseded per
ADR-44. The binding patterns live in decisions.md / CONVENTIONS.md and the
django-data / django-backend skills; Phase 0 rewrites these models from those
sources. Do not copy this code as-is (known draft deviation: balance stored on
Pass, superseded by the separate Balance aggregate in ADR-4/ADR-44).
"""

import uuid
from django.db import models

class Pass(models.Model):
    class Status(models.TextChoices):
        ISSUED = "issued", "Issued"
        REDEEMED = "redeemed", "Redeemed"
        VOIDED = "voided", "Voided"
        EXPIRED = "expired", "Expired"

    class PushStatus(models.TextChoices):
        OK = "ok", "OK"
        PENDING = "pending", "Pending"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="passes")
    program = models.ForeignKey("programs.Program", on_delete=models.CASCADE, related_name="passes")
    pass_style = models.CharField(max_length=30)
    apple_pass_type_id = models.CharField(max_length=255, null=True, blank=True)
    apple_pass_serial = models.CharField(max_length=255, null=True, blank=True)
    google_class_id = models.CharField(max_length=255, null=True, blank=True)
    google_object_id = models.CharField(max_length=255, null=True, blank=True)
    stamps_earned = models.PositiveIntegerField(default=0)
    points_balance = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)
    last_pushed_at = models.DateTimeField(null=True, blank=True)
    push_status = models.CharField(max_length=20, choices=PushStatus.choices, null=True, blank=True)
    push_error = models.TextField(null=True, blank=True)
    voided_at = models.DateTimeField(null=True, blank=True)
    voided_reason = models.CharField(max_length=500, null=True, blank=True)
    pass_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "passes"
        constraints = [models.UniqueConstraint(fields=["customer", "program"], name="uq_pass_customer_program")]
        indexes = [models.Index(fields=["program", "status"]), models.Index(fields=["push_status"], name="idx_pass_failed", condition=models.Q(push_status="failed"))]

    def __str__(self):
        return f"{self.customer.first_name} - {self.program.name}"
