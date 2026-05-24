from ..models import User, UserRole, Attempt, Question, Quiz, Subject
from ..tasks import create_notifications
from django.db.models.signals import post_save
from django.dispatch import receiver

NOTIFICATION_MODELS = {
    Attempt,
    Question,
    Quiz,
    Subject,
    User,
}


def handle_notifications(sender, instance, **kwargs):
    admin_ids = list(
        User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
    )
    create_notifications.delay(
        recipient_ids=admin_ids,
        title=f"{sender.__name__}",
        content=f"{instance}",
        data={
            "model": sender.__name__,
            "object_id": instance.id,
        },
    )


for model in NOTIFICATION_MODELS:

    @receiver(
        post_save,
        sender=model,
        dispatch_uid=f"{model.__name__}_notification_signal",
    )
    def receiver_models(sender, instance, **kwargs):
        handle_notifications(
            sender=sender,
            instance=instance,
            **kwargs,
        )
