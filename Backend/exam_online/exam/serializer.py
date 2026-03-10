from rest_framework import serializers
from .models import Question, Quiz

class QuestionSerializer(serializers.Serializer):
    model = Question
    class Meta:
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only = True)
    class Meta:
        model = Quiz
        fields = ["title",
                  "description",
                  "author",
                  "time_limit",
                  "author_name",
                ]
        extra_kwargs = {
            "created_at" : {"read_only": True}
        }
