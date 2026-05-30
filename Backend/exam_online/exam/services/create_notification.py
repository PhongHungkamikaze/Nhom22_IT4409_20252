from ..models import Notification


def create_notification(
    *,
    recipient,
    title: str,
    type: str = "GENERIC",
    content: str = "",
    actor=None,
    data: dict | None = None,
) -> Notification:
    return Notification.objects.create(
        recipient_id=getattr(recipient, "pk", recipient),
        actor_id=getattr(actor, "pk", actor) if actor else None,
        title=title,
        type=type,
        content=content,
        data=data or {},
    )
