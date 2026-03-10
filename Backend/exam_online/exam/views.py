from rest_framework import viewsets, response
from .models import Quiz
from rest_framework.decorators import action
from .serializer import QuizSerializer, QuestionSerializer
# Create your views here.


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    @action(detail=True, methods=["GET"])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = quiz.questions.all()
        serializer = QuestionSerializer(questions, many=True)
        return response.Response(serializer.data)
