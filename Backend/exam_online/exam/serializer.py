from rest_framework import serializers
from rest_framework.decorators import action
from .models import Question, Quiz


class QuestionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = Question
        fields = ["quiz", "type", "content", "quiz_title",]

    @action(detail=True, methods=["get"])
    def question(self, request, pk=None):
        pass


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
