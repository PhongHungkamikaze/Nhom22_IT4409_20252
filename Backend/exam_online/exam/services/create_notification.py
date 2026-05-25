from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from ..models import Notification
from ..serializers.notification import NotificationSerializer


def create_notification(
    *,
    recipient,  # User instance or PK
    title: str,
    type: str = "GENERIC",
    content: str = "",
    actor=None,
    data: dict | None = None,
) -> Notification:
    with transaction.atomic():
        notification = Notification.objects.create(
            recipient_id=getattr(recipient, "pk", recipient),
            actor_id=getattr(actor, "pk", actor) if actor else None,
            title=title,
            type=type,
            content=content,
            data=data or {},
        )
    
    return notification
