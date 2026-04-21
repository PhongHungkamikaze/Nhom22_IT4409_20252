from exam.permissions import PermissionMixin, IsAdminUser, IsTeacherUser, IsOwnerTeacher
from drf_spectacular.utils import extend_schema

from ..models import Question
from ..serializers import QuestionSerializer
from ..filters import QuestionFilter
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend


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

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ["content", "quiz__title"]

    @property
    def filterset_class(self):
        return QuestionFilter
