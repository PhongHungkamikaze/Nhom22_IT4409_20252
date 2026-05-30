from drf_spectacular.utils import extend_schema
from ..models import Answer
from ..serializers import AnswerSerializer
from ..filters import AnswerFilter
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from exam.permissions import IsAdminUser, IsTeacherUser, PermissionMixin


@extend_schema(tags=["Answer"])
class AnswerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        Answer.objects.all()
        .select_related("attempt", "question")
        .prefetch_related("selected_choices")
    )
    serializer_class = AnswerSerializer

    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]

    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["question__content", "attempt__user__username"]
    ordering_fields = ["id", "attempt", "question"]
    ordering = ["id"]
    filterset_class = AnswerFilter
