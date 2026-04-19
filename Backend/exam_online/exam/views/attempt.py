from drf_spectacular.utils import extend_schema
from ..models import Attempt, Answer, StatusChoices
from ..serializers import AttemptSerializer, AnswerSerializers
from ..filters import AttemptFilter
from rest_framework import viewsets, response, filters, status
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from ..tasks import calculate_score


@extend_schema(tags=["Attempt"])
class AttemptViewSet(viewsets.ModelViewSet):
    queryset = (
        Attempt.objects.all().select_related("user", "quiz").prefetch_related("answers")
    )
    serializer_class = AttemptSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ["user__username", "quiz__title", "status"]

    @property
    def filterset_class(self):
        return AttemptFilter

    @action(detail=True, methods=["post"], url_path="save-answer")
    def save_answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != StatusChoices.Ongoing:
            return response.Response(
                {"error": "Invalid attempt"}, status=status.HTTP_400_BAD_REQUEST
            )
        serializer = AnswerSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        choices = serializer.validated_data["selected_choices"]

        if question.quiz.id != attempt.quiz.id:
            return response.Response(
                {"error": "Invalid question"}, status=status.HTTP_400_BAD_REQUEST
            )

        # get or create
        answer, _ = Answer.objects.get_or_create(attempt=attempt, question=question)

        # update choices
        answer.selected_choices.set(choices)

        return response.Response({"message": "Saved"})

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != StatusChoices.Ongoing:
            return response.Response(
                {"error": "Already submitted"}, status=status.HTTP_400_BAD_REQUEST
            )
        attempt.status = StatusChoices.Processing
        attempt.save(update_fields=["status"])
        calculate_score.delay(attempt.id)
        return response.Response(
            {"message": "Calculate in progress..."}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request):
        quiz = request.query_params.get("quiz_id")

        attempt = Attempt.objects.filter(
            user=request.user, quiz=quiz, status=StatusChoices.Ongoing
        ).first()

        if not attempt:
            return response.Response(
                {"detail": "No active attempt"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(attempt)
        return response.Response(serializer.data)
