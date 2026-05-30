from drf_spectacular.utils import extend_schema
from ..models import User
from ..serializers import UserSerializer
from ..filters import UserFilter
from ..views.base import BaseViewSet
from exam.permissions import IsAdminUser, IsTeacherUser

@extend_schema(tags=["User"])
class UserViewSet(BaseViewSet):
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
    search_fields = ["username", "email"]
    ordering_fields = ["id", "username", "role", "date_joined"]
    ordering = ["id"]
    filterset_class = UserFilter

