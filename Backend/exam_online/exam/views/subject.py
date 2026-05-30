from drf_spectacular.utils import extend_schema
from ..models import Subject
from ..serializers import SubjectSerializer
from ..filters import SubjectFilter
from ..views.base import BaseViewSet
from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
)


@extend_schema(tags=["Subjects: Subject"])
class SubjectViewSet(BaseViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    search_fields = ["name"]
    ordering_fields = ["id", "name"]
    ordering = ["name"]
    filterset_class = SubjectFilter

    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]
