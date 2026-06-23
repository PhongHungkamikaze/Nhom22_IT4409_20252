import os

from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from ..models import FileSet
from ..serializers import FileSetSerializer, FileSetCreateSerializer
from ..filters import FileSetFilter
from ..views.base import BaseViewSet
from exam.models import UserRole
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

    permission_classes = [IsAdminUser | IsTeacherUser | IsStudentUser]

    def create(self, request, *args, **kwargs):
        input_serializer = FileSetCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        instance = input_serializer.save(uploaded_by=request.user)
        output_serializer = FileSetSerializer(instance)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Download file",
        description="Download the actual file with Content-Disposition: attachment",
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        fileset = self.get_object()
        response = FileResponse(
            fileset.file.open(),
            as_attachment=True,
            filename=os.path.basename(fileset.file.name),
        )
        return response

    def get_queryset(self):
        user = self.request.user
        all_param = self.request.query_params.get("all")
        if all_param and user.role in [UserRole.Admin, UserRole.Teacher]:
            return FileSet.objects.all()
        return FileSet.objects.filter(uploaded_by=user)
