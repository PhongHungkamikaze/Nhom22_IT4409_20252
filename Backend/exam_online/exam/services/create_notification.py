from django.db import transaction

from ..models import Notification


def create_notification(
    *,
    recipient,  # User instance
    title: str,
    type: str = "GENERIC",
    content: str = "",
    actor=None,
    data: dict | None = None,
) -> Notification:
    with transaction.atomic():
        return Notification.objects.create(
            recipient_id=getattr(recipient, "pk", recipient),
            actor_id=getattr(actor, "pk", actor) if actor else None,
            title=title,
            type=type,
            content=content,
            data=data or {},
        )
