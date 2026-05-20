from exam.permissions import PermissionMixin, IsAdminUser, IsTeacherUser, IsOwnerTeacher
from drf_spectacular.utils import extend_schema

from ..models import Question
from ..serializers import QuestionSerializer
from ..filters import QuestionFilter
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import User, UserRole
from ..tasks.create_notifications import create_notifications


@extend_schema(tags=["Question"])
class QuestionViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Question.objects.all().prefetch_related("quizzes", "choices")
    serializer_class = QuestionSerializer
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser],
        "create": [IsTeacherUser],
        "update": [IsTeacherUser, IsOwnerTeacher],
        "partial_update": [IsTeacherUser, IsOwnerTeacher],
        "destroy": [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        question = serializer.save(author=self.request.user)
        # Create notification for all admins
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Câu hỏi mới",
            content=f"Người dùng {self.request.user.username} đã tạo câu hỏi mới: {question.content[:50]}...",
        )

    def perform_update(self, serializer):
        question = serializer.save()
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Cập nhật câu hỏi",
            content=f"Người dùng {self.request.user.username} đã cập nhật câu hỏi: {question.content[:50]}...",
        )

    def perform_destroy(self, instance):
        content = instance.content
        instance.delete()
        admin_ids = list(
            User.objects.filter(role=UserRole.Admin).values_list("id", flat=True)
        )
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Xóa câu hỏi",
            content=f"Người dùng {self.request.user.username} đã xóa câu hỏi: {content[:50]}...",
        )

    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["content"]
    ordering_fields = ["id", "type"]
    ordering = ["id"]
    filterset_class = QuestionFilter
