from django.contrib import admin
from .models import Task, TaskHistory, Reminder

admin.site.register(Task)
admin.site.register(TaskHistory)
admin.site.register(Reminder)
