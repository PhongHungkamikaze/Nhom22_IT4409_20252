from exam.permissions import PermissionMixin, IsAdminUser, IsTeacherUser, IsOwnerTeacher
from ..models import Question
from ..serializers import QuestionSerializer
from ..filters import QuestionFilter
from rest_framework import viewsets


class QuestionViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Question.objects.all().select_related("quiz").prefetch_related("choices")
    serializer_class = QuestionSerializer
    permission_classes_by_action = {
        "list":           [IsTeacherUser | IsAdminUser],
        "retrieve":       [IsTeacherUser | IsAdminUser],
        "create":         [IsTeacherUser],
        "update":         [IsTeacherUser, IsOwnerTeacher],
        "partial_update": [IsTeacherUser, IsOwnerTeacher],
        "destroy":        [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]

    @property
    def filterset_class(self):
        return QuestionFilter
