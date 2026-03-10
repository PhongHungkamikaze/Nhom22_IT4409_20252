from rest_framework import serializers
from .models import Question, Quiz


class QuestionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = Question
        fields = [
            "quiz",
            "type",
            "content",
            "quiz_title",
        ]


class QuizSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "title",
            "description",
            "author",
            "time_limit",
            "author_name",
        ]
        extra_kwargs = {"created_at": {"read_only": True}}
