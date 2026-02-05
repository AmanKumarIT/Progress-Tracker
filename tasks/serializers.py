from rest_framework import serializers
from .models import Task, TaskHistory, Reminder


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = "__all__"


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    history = TaskHistorySerializer(many=True, read_only=True)
    reminders = ReminderSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "failed_at"]
