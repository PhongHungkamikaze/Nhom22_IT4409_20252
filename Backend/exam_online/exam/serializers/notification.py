from rest_framework import serializers

from ..models import Notification, User


class SimpleUserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class NotificationSerializer(serializers.ModelSerializer):
    actor = SimpleUserNotificationSerializer(read_only=True)
    is_read = serializers.BooleanField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "content",
            "data",
            "is_read",
            "read_at",
            "sent_at",
            "actor",
            "created_at",
        ]
        read_only_fields = fields


class NotificationListSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source="actor.username")
    recipient_name = serializers.ReadOnlyField(source="recipient.username")

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "content",
            "is_read",
            "read_at",
            "sent_at",
            "actor",
            "actor_name",
            "recipient",
            "recipient_name",
            "created_at",
            "data",
        ]


class MarkBulkSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)
