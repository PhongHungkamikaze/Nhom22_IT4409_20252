from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from ..models import Notification


@shared_task
def purge_deleted_notifications():
    threshold = timezone.now() - timedelta(
        days=getattr(settings, "NOTIFICATION_PURGE_AFTER_DAYS", 30)
    )
    deleted, _ = Notification.all_objects.filter(
        deleted_at__isnull=False, deleted_at__lt=threshold
    ).delete()
    return deleted
