from rest_framework import serializers
from ..models import Question, Quiz, Choice


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = [
            "id",
            "question",
            "content",
            "is_correct",
        ]
        extra_kwargs = {"is_correct": {"write_only": True}}


class QuestionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "quiz",
            "type",
            "content",
            "quiz_title",
            "choices",
        ]

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", None)
        question = super().create(validated_data)
        self._create_choice(question, choices_data)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop("choices", None)
        instance = super().update(instance, validated_data)

        if choices_data is not None:
            instance.choices.all().delete()
            self._create_choice(instance, choices_data)
        return instance

    def _create_choice(self, question, choices):
        new_choice = []
        for choice in choices:
            new_choice.append(Choice(question=question, **choice))
        Choice.objects.bulk_create(new_choice)


class QuizSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "author",
            "time_limit",
            "author_name",
            "created_at",
        ]
        extra_kwargs = {"created_at": {"read_only": True}}
