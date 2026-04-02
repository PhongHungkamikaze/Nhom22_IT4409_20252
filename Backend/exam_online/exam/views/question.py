from exam.permissions import PermissionMixin, IsAdminUser, IsTeacherUser, IsOwnerTeacher
from ..models import Question
from ..serializers import (
    QuestionSerializer,
)
from rest_framework import viewsets


class QuestionViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Question.objects.all()
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
