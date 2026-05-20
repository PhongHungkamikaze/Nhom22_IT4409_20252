from datetime import timedelta
from rest_framework import serializers
from ..models import Attempt
from .answer import AnswerSerializer


class AttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    started_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    finished_at = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            "id",
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
        extra_kwargs = {
            "score": {"read_only": True},
            "status": {"read_only": True},
            "user": {"read_only": True},
        }

    def get_finished_at(self, obj):
        if obj.quiz.time_limit:
            return (obj.started_at + timedelta(minutes=obj.quiz.time_limit)).isoformat()
        return None
