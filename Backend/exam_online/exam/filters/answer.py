import django_filters
from ..models import Answer


class AnswerFilter(django_filters.FilterSet):
    """
    Filter cho Answer API.

    Ví dụ sử dụng:
      GET /api/answers/?attempt=1           ← tất cả câu trả lời của 1 attempt
      GET /api/answers/?question=5          ← tất cả câu trả lời cho 1 câu hỏi
      GET /api/answers/?attempt=1&question=5
    """

    # Lọc theo nội dung câu hỏi
    question_content = django_filters.CharFilter(
        field_name="question__content",
        lookup_expr="icontains",
        label="Tìm theo nội dung câu hỏi",
    )

    # Lọc theo quiz (thông qua attempt)
    quiz = django_filters.NumberFilter(
        field_name="attempt__quiz",
        lookup_expr="exact",
        label="Lọc theo quiz ID",
    )

    # Lọc theo username người làm bài (thông qua attempt)
    username = django_filters.CharFilter(
        field_name="attempt__user__username",
        lookup_expr="icontains",
        label="Tìm theo username",
    )

    class Meta:
        model = Answer
        fields = {
            "id": ["exact", "in"],
            "attempt": ["exact"],  # ?attempt=<id>
            "question": ["exact"],  # ?question=<id>
        }
