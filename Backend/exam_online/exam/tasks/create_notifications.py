import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def create_notifications(
    recipient_ids: list[int],
    *,
    title: str,
    type: str = "GENERIC",
    content: str = "",
    actor_id: int | None = None,
    data: dict | None = None,
) -> int:
    if not recipient_ids:
        return 0

    from ..models import Notification

    notifications = [
        Notification(
            recipient_id=rid,
            actor_id=actor_id,
            title=title,
            type=type,
            content=content,
            data=data or {},
        )
        for rid in recipient_ids
    ]

    created = Notification.objects.bulk_create(notifications)

    from ..tasks import send_notification

    for n in created:
        send_notification.delay(n.id)

    logger.info("Created %s notifications of type %s", len(created), type)
    return len(created)
