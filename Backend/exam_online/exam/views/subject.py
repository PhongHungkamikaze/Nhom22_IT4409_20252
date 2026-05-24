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
