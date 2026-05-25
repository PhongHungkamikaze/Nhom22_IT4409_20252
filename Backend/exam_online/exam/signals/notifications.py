from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from ..models import Notification
from ..tasks import send_notification


@receiver(post_save, sender=Notification)
def enqueue_send_notification(sender, instance, created, **kwargs):
    if not created:
        return
    # Đảm bảo Task chỉ chạy sau khi DB đã Commit thành công
    transaction.on_commit(lambda: send_notification.delay(instance.id))
