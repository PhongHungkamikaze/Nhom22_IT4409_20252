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
    
    # Push to WebSocket
    try:
        channel_layer = get_channel_layer()
        serialized = NotificationSerializer(notification).data
        
        async_to_sync(channel_layer.group_send)(
            f"notifications_{notification.recipient_id}",
            {
                "type": "notification_created",
                "notification": serialized
            }
        )
    except Exception as e:
        # Don't fail the transaction if WS fails
        print(f"Error pushing notification to WS: {e}")
        
    return notification
