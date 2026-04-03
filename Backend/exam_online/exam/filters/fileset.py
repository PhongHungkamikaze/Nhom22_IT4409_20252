import django_filters
from ..models import FileSet


class FileSetFilter(django_filters.FilterSet):
    """
    Filter cho FileSet API.

    Ví dụ sử dụng:
      GET /api/filesets/?name=report        ← tìm theo tên file (icontains)
      GET /api/filesets/?uploaded_by=1      ← lọc theo user ID (admin)
      GET /api/filesets/?uploader=teacher1  ← lọc theo username (admin)
      GET /api/filesets/?created_after=2025-01-01
      GET /api/filesets/?created_before=2025-12-31
    """

    # Tìm theo tên file (không phân biệt hoa/thường)
    name = django_filters.CharFilter(
        field_name="name",
        lookup_expr="icontains",
        label="Tìm theo tên file",
    )

    # Lọc theo username người tải lên
    uploader = django_filters.CharFilter(
        field_name="uploaded_by__username",
        lookup_expr="icontains",
        label="Tìm theo username người tải lên",
    )

    # Lọc theo khoảng thời gian tạo
    created_after = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
        label="Tạo sau ngày (>=)",
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
        label="Tạo trước ngày (<=)",
    )

    class Meta:
        model = FileSet
        fields = {
            "id":          ["exact", "in"],
            "uploaded_by": ["exact"],     # ?uploaded_by=<user_id>
        }
