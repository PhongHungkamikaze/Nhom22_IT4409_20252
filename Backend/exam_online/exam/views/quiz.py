from ..models import Quiz
from ..serializers import (
    QuizSerializer,
)
from ..serializers import (
    AttemptSerializer
)
from rest_framework import viewsets, status, response
from rest_framework.decorators import action
from ..models import StatusChoices, Attempt
from django.utils import timezone
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        quiz = self.get_object()

        # 1. Check attempt đang làm
        existing_attempt = Attempt.objects.filter(
            user=request.user,
            quiz=quiz,
            status=StatusChoices.Ongoing
        ).first()

        if existing_attempt:
            serializer = AttemptSerializer(existing_attempt)
            return response.Response(
                {
                    "message": "You already have an active attempt",
                    "attempt": serializer.data
                },
                status=status.HTTP_200_OK
            )

        # 2. Tạo attempt mới
        attempt = Attempt.objects.create(
            user=request.user,
            quiz=quiz,
            status=StatusChoices.Ongoing,
            started_at=timezone.now()
        )

        serializer = AttemptSerializer(attempt)
        return response.Response(
            {
                "message": "Start quiz successfully",
                "attempt": serializer.data
            },
            status=status.HTTP_201_CREATED
        )