from ..models import Attempt
from ..serializers import (
    AttemptSerializer,AnswerSerializers
)
from ..models import Answer, StatusChoices
from rest_framework import viewsets, response
from rest_framework.decorators import action
from ..calculate_score import calculate_score

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all().prefetch_related("answers")
    serializer_class = AttemptSerializer
        
    @action(detail=True, methods=["post"], url_path="save-answer")
    def save_answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != StatusChoices.Ongoing:
            return response.Response({"error": "Invalid attempt"}, status=400)
        serializer = AnswerSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        choices = serializer.validated_data["selected_choices"]

        if question.quiz.id != attempt.quiz.id:
            return response.Response({"error": "Invalid question"}, status=400)

        # get or create
        answer, _ = Answer.objects.get_or_create(
            attempt=attempt,
            question=question
        )

        # update choices
        answer.selected_choices.set(choices)

        return response.Response({"message": "Saved"})

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != StatusChoices.Ongoing:
            return response.Response({"error": "Already submitted"}, status=400)
        attempt.score = calculate_score(attempt)
        attempt.status = StatusChoices.Completed
        attempt.save()
        return response.Response({"score": attempt.score})
    
    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request):
        quiz = request.query_params.get("quiz_id")

        attempt = Attempt.objects.filter(
            user=request.user,
            quiz=quiz,
            status=StatusChoices.Ongoing
        ).first()

        if not attempt:
            return response.Response(
                {"detail": "No active attempt"},
                status=404
            )

        serializer = self.get_serializer(attempt)
        return response.Response(serializer.data)