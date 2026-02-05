from django.contrib import admin
from .models import Task, TaskHistory, Reminder


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "status",
        "target_date",
        "created_at",
    )
    list_filter = ("category", "status")
    search_fields = ("title", "description")
    ordering = ("-created_at",)


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ("task", "old_status", "new_status", "changed_at")
    ordering = ("-changed_at",)


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ("task", "remind_at", "is_sent")
    list_filter = ("is_sent",)
