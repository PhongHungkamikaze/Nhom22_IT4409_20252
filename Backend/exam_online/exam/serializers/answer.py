from rest_framework import serializers
from ..models import Answer, Choice


class AnswerSerializers(serializers.ModelSerializer):
    question_content = serializers.CharField(source="question.content", read_only=True)
    selected_choices = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Choice.objects.all()
    )

    class Meta:
        model = Answer
        fields = ["attempt", "question", "question_content", "selected_choices"]

    def validate(self, data):
        question = data["question"]
        choices = data["selected_choices"]

        for choice in choices:
            if choice.question.id != question.id:
                raise serializers.ValidationError(
                    f"Lựa chọn {choice.id} không thuộc về câu hỏi này!"
                )
        return data

    def create(self, validated_data):
        choices = validated_data.pop("selected_choices", None)
        instance = super().create(validated_data)
        if choices is not None:
            instance.selected_choices.set(choices)
        return instance

    def update(self, instance, validated_data):
        choices = validated_data.pop("selected_choices", None)
        instance = super().update(instance, validated_data)
        if choices is not None:
            instance.selected_choices.set(choices)
        return instance
