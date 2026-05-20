from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
    IsStudentUser,
    IsOwnerTeacher,
    PermissionMixin,
)
from drf_spectacular.utils import extend_schema

from ..models import Quiz
from ..serializers import QuizSerializer, AttemptSerializer, QuestionSerializer
from rest_framework import viewsets, status, response
from rest_framework.decorators import action
from ..models import StatusChoices, Attempt
from ..filters import QuizFilter
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from ..tasks.create_notifications import create_notifications
from ..models import User, UserRole


@extend_schema(tags=["Quiz"])
class QuizViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Quiz.objects.all().prefetch_related("questions__choices")
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser | IsStudentUser],
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
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["title", "description", "author__username", "subject__name"]
    ordering_fields = ["id", "created_at", "time_limit", "title"]
    ordering = ["-created_at"]
    filterset_class = QuizFilter

    def perform_create(self, serializer):
        quiz = serializer.save(author=self.request.user)
        # Create notification for all admins
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Bài thi mới",
            content=f"Giáo viên {self.request.user.username} đã tạo bài thi mới: {quiz.title}",
        )

    def perform_update(self, serializer):
        quiz = serializer.save()
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Cập nhật bài thi",
            content=f"Người dùng {self.request.user.username} đã cập nhật bài thi: {quiz.title}",
        )

    def perform_destroy(self, instance):
        title = instance.title
        instance.delete()
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Xóa bài thi",
            content=f"Người dùng {self.request.user.username} đã xóa bài thi: {title}",
        )

    def get_serializer_class(self):
        if self.action == "start":
            return None

        return super().get_serializer_class()

    def get_queryset(self):
        """
        Filter quizzes based on user role:
        - Students: only see published quizzes
        - Teachers: see all quizzes + edit own quizzes
        - Admins: see all quizzes
        """
        queryset = Quiz.objects.all().prefetch_related("questions__choices")

        # Check user role
        if hasattr(self.request, "user") and self.request.user.is_authenticated:
            if self.request.user.role == "student":
                # Students only see published quizzes
                queryset = queryset.filter(is_published=True)
        return queryset

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
        count_attempt = (
            Attempt.objects.filter(
                user=request.user, quiz=quiz, status=StatusChoices.Processing
            ).count()
            + Attempt.objects.filter(
                user=request.user, quiz=quiz, status=StatusChoices.Completed
            ).count()
        )

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
        )

        serializer = AttemptSerializer(attempt)
        return response.Response(
            {"message": "Start quiz successfully", "attempt": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="published")
    def published(self, request, pk=None):
        quiz = self.get_object()
        quiz.is_published = True
