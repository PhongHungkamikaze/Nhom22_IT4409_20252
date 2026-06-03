import logging

from celery import shared_task
from django.utils import timezone

from ..models import Notification

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_notification(self, notification_id: int):
    try:
        n = Notification.all_objects.get(id=notification_id)
    except Notification.DoesNotExist:
        logger.warning("Notification %s not found", notification_id)
        return

    if n.sent_at is not None:
        logger.info("Notification %s already sent at %s", notification_id, n.sent_at)
        return

    logger.info(
        "Sending notification id=%s recipient=%s type=%s",
        n.id,
        n.recipient_id,
        n.type,
    )

    n.sent_at = timezone.now()
    n.save(update_fields=["sent_at"])

    try:
        from exam_online.firebase import sync_notification_to_firestore
        sync_notification_to_firestore(n)
    except Exception as e:
        logger.error("Error syncing to Firestore for notification %s: %s", notification_id, e)
