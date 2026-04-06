# exam_online/exam/views/fileset.py

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from ..models import FileSet
from ..serializers import FileSetSerializer
from ..filters import FileSetFilter


class FileSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet CRUD cho File.

    Endpoints (với prefix `filesets/`):
      GET    /filesets/           → Danh sách file của user hiện tại
      POST   /filesets/           → Tải file lên
      GET    /filesets/<id>/      → Chi tiết một file
      PUT    /filesets/<id>/      → Cập nhật toàn bộ (thay thế file)
      PATCH  /filesets/<id>/      → Cập nhật một phần (đổi tên, v.v.)
      DELETE /filesets/<id>/      → Xóa file
    """

    serializer_class = FileSetSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Hỗ trợ nhận multipart/form-data (upload file)
    parser_classes = [MultiPartParser, FormParser]

    @property
    def filterset_class(self):
        return FileSetFilter

    def get_queryset(self):
        """
        Mỗi user chỉ nhìn thấy file của chính họ.
        Admin có thể xem tất cả nếu truyền query param ?all=true.
        """
        user = self.request.user
        show_all = self.request.query_params.get("all", "false").lower() == "true"

        if show_all and user.is_staff:
            return FileSet.objects.select_related("uploaded_by").all()

        return FileSet.objects.select_related("uploaded_by").filter(uploaded_by=user)

    def get_serializer_context(self):
        """Truyền request vào serializer để build_absolute_uri hoạt động."""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        """POST /filesets/ - Tải file lên."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # uploaded_by được gán trong serializer.create()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """DELETE /filesets/<id>/ - Xóa file (kể cả file vật lý trên disk)."""
        instance = self.get_object()
        # Xóa file vật lý khỏi storage trước khi xóa record trong DB
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()
        return Response(
            {"detail": "File deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
