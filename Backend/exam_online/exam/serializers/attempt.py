from rest_framework import serializers
from ..models import Attempt
from .answer import AnswerSerializers


class AttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    answers = AnswerSerializers(many=True, read_only=True)

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
            "answers",
        ]
        extra_kwargs = {"score": {"read_only": True}, "status": {"read_only": True}}
