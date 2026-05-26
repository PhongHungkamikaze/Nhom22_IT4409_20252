from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import User
from ..serializers import UserSerializer
from ..filters import UserFilter
from exam.permissions import IsAdminUser, IsTeacherUser, PermissionMixin

@extend_schema(tags=["User"])
class UserViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes_by_action = {
        "list": [IsAdminUser | IsTeacherUser],
        "retrieve": [IsAdminUser],
        "create": [IsAdminUser],
        "update": [IsAdminUser],
        "partial_update": [IsAdminUser],
        "destroy": [IsAdminUser],
    }
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["username", "email"]
    ordering_fields = ["id", "username", "role", "date_joined"]
    ordering = ["id"]
    filterset_class = UserFilter

