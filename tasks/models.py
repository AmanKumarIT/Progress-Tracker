from django.db import models
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    target_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class TaskHistory(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='history',
        on_delete=models.CASCADE
    )
    old_status = models.CharField(max_length=10)
    new_status = models.CharField(max_length=10)
    changed_at = models.DateTimeField(auto_now_add=True)


class Reminder(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='reminders',
        on_delete=models.CASCADE
    )
    remind_at = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
