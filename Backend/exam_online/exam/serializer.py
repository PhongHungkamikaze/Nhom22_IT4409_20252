from rest_framework import serializers
from .models import Question, Quiz, Choice


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
            "created_at"
        ]
        extra_kwargs = {"created_at": {"read_only": True}}

class ChoiceSerializer(serializers.ModelSerializer):
    question_name = serializers.CharField(source = "question.content", read_only = True)
    class Meta:
        model = Choice
        fields = [
            "question",
            "content",
            "is_correct",
            "question_name",
        ]
        extra_kwargs = {"is_correct": {"write_only": True}}