from rest_framework import viewsets, response
from .models import Choice, Quiz, Question, Attempt
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from .serializers import QuizSerializer, QuestionSerializer, AttemptSerializer
# Create your views here.


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.prefetch_related("questions").all()
    serializer_class = QuizSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.prefetch_related("choices").all()
    serializer_class = QuestionSerializer


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.prefetch_related("attempts").all()
    serializer_class = AttemptSerializer
