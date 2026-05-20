from rest_framework import serializers
from ..models import Question, Quiz, Choice
from ..models import UserRole


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = [
            "id",
            "content",
            "is_correct",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and request.user.role == UserRole.Student
        ):
            fields.pop("is_correct", None)
        return fields


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "type",
            "content",
            "author_name",
            "choices",
        ]

    def validate(self, data):
        type_question = data.get("type")
        choices = data.get("choices", [])

        if not choices:
            raise serializers.ValidationError({"choices": "Câu hỏi phải có ít nhất một lựa chọn."})

        correct_count = sum(1 for c in choices if c.get("is_correct", False))

        if type_question == Question.TypeQuestion.Single:
            if correct_count != 1:
                raise serializers.ValidationError(
                    {"choices": "Câu hỏi một lựa chọn phải có duy nhất một đáp án đúng."}
                )
        elif type_question == Question.TypeQuestion.Multiple:
            if correct_count < 1:
                raise serializers.ValidationError(
                    {"choices": "Câu hỏi nhiều lựa chọn phải có ít nhất một đáp án đúng."}
                )

        return data

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", None)
        request = self.context.get("request")
        validated_data["author"] = request.user
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
    subject_name = serializers.CharField(
        source="subject.name", read_only=True, default=None
    )

    questions = QuestionSerializer(many=True, read_only=True)

    question_ids = serializers.PrimaryKeyRelatedField(
        source="questions",
        many=True,
        queryset=Question.objects.all(),
        write_only=True,
        required=False,
    )
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "author",
            "time_limit",
            "author_name",
            "subject",
            "subject_name",
            "created_at",
            "is_published",
            "max_attempts",
            "questions",
            "question_ids",
            "question_count",
        ]
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True},
            "subject": {"read_only": True},
        }

    def get_question_count(self, obj):
        return obj.questions.count()

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
