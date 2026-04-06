import django_filters
from ..models import Question


class QuestionFilter(django_filters.FilterSet):
    """
    Filter cho Question API.

    Ví dụ sử dụng:
      GET /api/questions/?quiz=1
      GET /api/questions/?type=single
      GET /api/questions/?quiz=2&type=multiple
      GET /api/questions/?content=python       ← tìm theo nội dung (icontains)
    """

    # Tìm kiếm nội dung câu hỏi (không phân biệt hoa/thường)
    content = django_filters.CharFilter(
        field_name="content",
        lookup_expr="icontains",
        label="Tìm theo nội dung câu hỏi",
    )

    # Lọc theo tiêu đề quiz (thay vì phải biết quiz_id)
    quiz_title = django_filters.CharFilter(
        field_name="quiz__title",
        lookup_expr="icontains",
        label="Tìm theo tên quiz",
    )

    class Meta:
        model = Question
        fields = {
            "id":   ["exact", "in"],
            "quiz": ["exact"],           # ?quiz=<id>
            "type": ["exact"],           # ?type=single | ?type=multiple
        }
