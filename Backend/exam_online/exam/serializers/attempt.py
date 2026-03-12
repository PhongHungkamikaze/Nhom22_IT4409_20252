from rest_framework import serializers
from models import Attempt


class AttemptSerializer(serializers.Serializer):
    username = serializers.CharField(source="user.username", read_only=True)
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "user",
            "username",
            "quiz",
            "quiz_title",
            "score",
            "status",
            "started_at",
            "finished_at",
        ]
        extra_kwargs = {"score": {"read_only": True}, "status": {"read_only": True}}
