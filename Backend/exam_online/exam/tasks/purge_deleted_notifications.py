import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from ..models import Notification

logger = logging.getLogger(__name__)


@shared_task
def purge_deleted_notifications():
    threshold = timezone.now() - timedelta(
        days=getattr(settings, "NOTIFICATION_PURGE_AFTER_DAYS", 30)
    )
    qs = Notification.all_objects.filter(
        deleted_at__isnull=False, deleted_at__lt=threshold
    )
    total, _ = qs.delete()
    if total:
        logger.info("Purged %s deleted notifications", total)
    return total
