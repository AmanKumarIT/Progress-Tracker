# imports
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.core.mail import send_mail
from datetime import timedelta

from .models import Task, TaskHistory, Reminder
from .serializers import TaskSerializer, ReminderSerializer


# =========================
# CLASS-BASED VIEW (TASKS)
# =========================

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.all().order_by("-created_at")

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        old_status = task.status

        response = super().update(request, *args, **kwargs)
        task.refresh_from_db()
        new_status = task.status

        if old_status != new_status:
            TaskHistory.objects.create(
                task=task,
                old_status=old_status,
                new_status=new_status
            )

            if new_status == "failure":
                task.failed_at = timezone.now()
            else:
                task.failed_at = None

            task.save(update_fields=["failed_at"])

        return response


# =========================
# FUNCTION-BASED VIEWS
# =========================

@api_view(["GET"])
def check_reminders(request):
    now = timezone.now()

    reminders = Reminder.objects.filter(
        remind_at__lte=now,
        is_sent=False
    )

    sent_count = 0

    for reminder in reminders:
        task = reminder.task

        send_mail(
            subject=f"Reminder: {task.title}",
            message=(
                f"Task: {task.title}\n"
                f"Category: {task.category}\n"
                f"Status: {task.status}"
            ),
            from_email=None,
            recipient_list=["akpailwar120@example.com"],
            fail_silently=True,
        )

        reminder.is_sent = True
        reminder.save(update_fields=["is_sent"])
        sent_count += 1

    return Response({"sent": sent_count})


@api_view(["POST"])
def create_reminder(request):
    serializer = ReminderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["DELETE"])
def cleanup_failed_tasks(request):
    cutoff = timezone.now() - timedelta(days=2)

    deleted_count, _ = Task.objects.filter(
        status="failure",
        failed_at__lte=cutoff
    ).delete()

    return Response({"deleted": deleted_count})
