from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from ..models import FileSet, UserRole
from ..serializers import FileSetSerializer, FileSetCreateSerializer
from ..filters import FileSetFilter
from ..views.base import BaseViewSet
from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
    IsStudentUser,
)


@extend_schema(tags=["FileSet"])
class FileSetViewSet(BaseViewSet):
    queryset = FileSet.objects.all()
    serializer_class = FileSetSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ["name", "subject__name"]
    ordering_fields = ["id", "name", "created_at"]
    ordering = ["-created_at"]
    filterset_class = FileSetFilter

    permission_classes = [IsAdminUser | IsTeacherUser]

    def create(self, request, *args, **kwargs):
        input_serializer = FileSetCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        instance = input_serializer.save(uploaded_by=request.user)
        output_serializer = FileSetSerializer(instance)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        return FileSet.objects.all()
