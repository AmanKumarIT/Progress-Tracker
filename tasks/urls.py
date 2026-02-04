from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TaskViewSet, create_reminder, cleanup_failed_tasks

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('check-reminders/', create_reminder),
    path('cleanup-failed/', cleanup_failed_tasks),

]

urlpatterns += router.urls



