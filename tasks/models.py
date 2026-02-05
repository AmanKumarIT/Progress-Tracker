from django.db import models
from django.utils import timezone


# =========================
# CONSTANTS
# =========================

CATEGORY_CHOICES = [
    ("internship", "Internship"),
    ("project", "Project"),
    ("hackathon", "Hackathon"),
]

STATUS_CHOICES = [
    ("progress", "In Progress"),
    ("success", "Success"),
    ("failure", "Failure"),
]


# =========================
# MAIN TASK MODEL
# =========================

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="project"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="progress"
    )

    target_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    failed_at = models.DateTimeField(null=True, blank=True)

    def mark_success(self):
        self.status = "success"
        self.failed_at = None
        self.save()

    def mark_failure(self):
        self.status = "failure"
        self.failed_at = timezone.now()
        self.save()

    def __str__(self):
        return self.title


# =========================
# STATUS HISTORY (AUDIT LOG)
# =========================

class TaskHistory(models.Model):
    task = models.ForeignKey(
        Task,
        related_name="history",
        on_delete=models.CASCADE
    )

    old_status = models.CharField(max_length=10)
    new_status = models.CharField(max_length=10)

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title}: {self.old_status} → {self.new_status}"


# =========================
# REMINDERS
# =========================

class Reminder(models.Model):
    task = models.ForeignKey(
        Task,
        related_name="reminders",
        on_delete=models.CASCADE
    )

    remind_at = models.DateTimeField()
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"Reminder for {self.task.title} at {self.remind_at}"
