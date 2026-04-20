from drf_spectacular.utils import extend_schema
from ..models import User
from ..serializers import UserSerializer
from rest_framework import viewsets
from exam.permissions import IsAdminUser


@extend_schema(tags=["User"])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
