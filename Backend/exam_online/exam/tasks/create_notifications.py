import logging

from celery import shared_task

from ..services.create_notification import create_notification

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
    count = 0
    for rid in recipient_ids:
        try:
            create_notification(
                recipient=rid,
                title=title,
                type=type,
                content=content,
                actor=actor_id,
                data=data,
            )
            count += 1
        except Exception:
            logger.exception("Failed creating notification for user %s", rid)
    return count
