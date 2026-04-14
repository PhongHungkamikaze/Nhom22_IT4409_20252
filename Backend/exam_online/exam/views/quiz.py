from exam.permissions import PermissionMixin
from exam.permissions import IsAdminUser, IsTeacherUser, IsStudentUser, IsOwnerTeacher
from drf_spectacular.utils import extend_schema

from ..models import Quiz
from ..serializers import QuizSerializer, AttemptSerializer, QuestionSerializer
from rest_framework import viewsets, status, response
from rest_framework.decorators import action
from ..models import StatusChoices, Attempt
from django.utils import timezone
from ..filters import QuizFilter
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend


@extend_schema(tags=["Quiz"])
class QuizViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Quiz.objects.all().prefetch_related("questions__choices")
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "create": [IsTeacherUser],
        "start": [IsStudentUser],
        "update": [IsTeacherUser, IsOwnerTeacher],
        "partial_update": [IsTeacherUser, IsOwnerTeacher],
        "destroy": [IsTeacherUser | IsAdminUser],
        "questions": [IsTeacherUser | IsAdminUser | IsStudentUser],
    }
    permission_classes = [IsAdminUser]
    serializer_class = QuizSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ["title", "author__username"]

    filterset_class = QuizFilter

    @action(detail=True, methods=["get"], url_path="questions")
    def questions(self, request, pk=None):
        quiz = self.get_object()

        questions = quiz.questions.all()

        serializer = QuestionSerializer(questions, many=True)

        return response.Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        quiz = self.get_object()

        # 1. Check attempt đang làm
        if not quiz.is_published:
            return response.Response(
                {
                    "message": "Quiz finish",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        count_attempt = Attempt.objects.filter(user=request.user, quiz=quiz).count()

        if count_attempt == quiz.max_attempts:
            return response.Response(
                {
                    "message": "Max attempts",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        existing_attempt = Attempt.objects.filter(
            user=request.user, quiz=quiz, status=StatusChoices.Ongoing
        ).first()

        if existing_attempt:
            serializer = AttemptSerializer(existing_attempt)
            return response.Response(
                {
                    "message": "You already have an active attempt",
                    "attempt": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        # 2. Tạo attempt mới
        attempt = Attempt.objects.create(
            user=request.user,
            quiz=quiz,
            status=StatusChoices.Ongoing,
            started_at=timezone.now(),
            finished_at=timezone.now() + timezone.timedelta(minutes=quiz.time_limit)
            if quiz.time_limit
            else None,
        )

        serializer = AttemptSerializer(attempt)
        return response.Response(
            {"message": "Start quiz successfully", "attempt": serializer.data},
            status=status.HTTP_201_CREATED,
        )
