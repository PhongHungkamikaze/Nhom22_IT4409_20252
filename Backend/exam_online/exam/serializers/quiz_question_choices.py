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
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "type",
            "content",
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

    questions = QuestionSerializer(many=True, read_only=True)

    question_ids = serializers.PrimaryKeyRelatedField(
        source="questions",
        many=True,
        queryset=Question.objects.all(),
        write_only=True,
        required=False,
    )

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
            "is_published",
            "max_attempts",
            "questions",
            "question_ids",
        ]
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["author"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        questions = validated_data.pop("questions", None)
        instance = super().update(instance, validated_data)
        if questions is not None:
            instance.questions.set(questions)

        return instance
