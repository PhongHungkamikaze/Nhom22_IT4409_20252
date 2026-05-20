from drf_spectacular.utils import extend_schema

from ..models import Attempt, Answer, StatusChoices, UserRole
from ..serializers import AttemptSerializer, AnswerSerializer
from ..filters import AttemptFilter
from rest_framework import viewsets, response, filters, status
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from exam.permissions import IsAdminUser, IsTeacherUser, IsStudentUser, PermissionMixin
from ..tasks import calculate_score


@extend_schema(tags=["Attempt"])
class AttemptViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        Attempt.objects.all().select_related("user", "quiz").prefetch_related("answers")
    )
    serializer_class = AttemptSerializer
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "create": [IsTeacherUser | IsStudentUser],
        "update": [IsStudentUser],
        "partial_update": [IsStudentUser],
        "destroy": [IsTeacherUser | IsAdminUser],
        "save_answer": [IsStudentUser],
        "submit": [IsStudentUser],
        "current": [IsStudentUser],
    }
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["user__username", "quiz__title"]
    ordering_fields = ["id", "started_at", "score"]
    ordering = ["-started_at"]
    filterset_class = AttemptFilter

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.Admin:
            return self.queryset
        elif user.role == UserRole.Teacher:
            # Teachers only see attempts for quizzes they created
            return self.queryset.filter(quiz__author=user)
        elif user.role == UserRole.Student:
            # Students only see their own attempts
            return self.queryset.filter(user=user)

        return self.queryset.none()

    @extend_schema(
        request=AnswerSerializer,
        responses={200: None},
        description="Save answer for an attempt",
    )
    @action(detail=True, methods=["post"], url_path="save-answer")
    def save_answer(self, request, pk=None):
        attempt = self.get_object()

        if attempt.status != StatusChoices.Ongoing:
            return response.Response(
                {"error": "Invalid attempt"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Đảm bảo dữ liệu có thông tin attempt và tìm instance cũ để update nếu có
        data = request.data.copy()
        if "attempt" not in data:
            data["attempt"] = attempt.id

        question_id = data.get("question")
        instance = Answer.objects.filter(
            attempt=attempt, question_id=question_id
        ).first()

        serializer = AnswerSerializer(
            instance=instance,
            data=data,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

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
        attempt = Attempt.objects.filter(
            user=request.user, status=StatusChoices.Ongoing
        ).first()

        if not attempt:
            return response.Response(
                {"detail": "No active attempt"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(attempt)
        return response.Response(serializer.data)
