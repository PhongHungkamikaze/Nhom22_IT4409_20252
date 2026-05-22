from rest_framework import viewsets, filters
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Subject
from ..serializers import SubjectSerializer
from ..filters import SubjectFilter
from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
    PermissionMixin,
)


@extend_schema(tags=["Subjects: Subject"])
class SubjectViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["id", "name"]
    ordering = ["name"]
    filterset_class = SubjectFilter

    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        subject = serializer.save()
        # Create notification for all admins
        from ..models import User, UserRole
        from ..tasks.create_notifications import create_notifications
        admin_ids = list(User.objects.filter(role=UserRole.Admin).values_list('id', flat=True))
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Môn học mới",
            content=f"Người dùng {self.request.user.username} đã tạo môn học mới: {subject.name}"
        )

    def perform_update(self, serializer):
        subject = serializer.save()
        from ..models import User, UserRole
        from ..tasks.create_notifications import create_notifications
        admin_ids = list(User.objects.filter(role=UserRole.Admin).values_list('id', flat=True))
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Cập nhật môn học",
            content=f"Người dùng {self.request.user.username} đã cập nhật môn học: {subject.name}"
        )

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        from ..models import User, UserRole
        from ..tasks.create_notifications import create_notifications
        admin_ids = list(User.objects.filter(role=UserRole.Admin).values_list('id', flat=True))
        create_notifications.delay(
            recipient_ids=admin_ids,
            title="Xóa môn học",
            content=f"Người dùng {self.request.user.username} đã xóa môn học: {name}"
        )
