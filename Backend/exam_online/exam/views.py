from rest_framework import viewsets, response
from .models import Choice, Quiz, Question
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from .serializer import QuizSerializer, QuestionSerializer, ChoiceSerializer
# Create your views here.


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.prefetch_related("questions").all()
    serializer_class = QuizSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.prefetch_related("choices").all()
    serializer_class = QuestionSerializer
