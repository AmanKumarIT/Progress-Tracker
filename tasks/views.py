from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Task, TaskHistory
from .serializers import TaskSerializer
from django.utils import timezone
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from .models import Reminder
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]


    def update(self, request, *args, **kwargs):
        task = self.get_object()
        old_status = task.status

        response = super().update(request, *args, **kwargs)
        new_status = response.data.get('status')

        if old_status != new_status:
            TaskHistory.objects.create(
                task=task,
                old_status=old_status,
                new_status=new_status
            )

            if new_status == 'FAILED':
                task.failed_at = timezone.now()
                task.save()

        return response

@api_view(['GET'])
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
            message=f"Task: {task.title}\nStatus: {task.status}",
            from_email=None,
            recipient_list=['akpailwar120@example.com'],
            fail_silently=True,
        )

        reminder.is_sent = True
        reminder.save()
        sent_count += 1

    return Response({
        "message": f"{sent_count} reminders sent"
    })

from rest_framework.decorators import api_view
from .models import Reminder
from .serializers import ReminderSerializer

@api_view(['POST'])
def create_reminder(request):
    serializer = ReminderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view

@api_view(['DELETE'])
def cleanup_failed_tasks(request):
    cutoff = timezone.now() - timedelta(days=2)

    deleted_count, _ = Task.objects.filter(
        status='FAILED',
        failed_at__lte=cutoff
    ).delete()

    return Response({
        "deleted": deleted_count
    })