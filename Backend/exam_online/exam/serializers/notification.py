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
    actor = SimpleUserNotificationSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "is_read",
            "read_at",
            "sent_at",
            "actor",
            "created_at",
        ]


class MarkBulkSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)
