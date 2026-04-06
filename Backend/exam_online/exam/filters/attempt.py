import django_filters
from ..models import Attempt, StatusChoices


class AttemptFilter(django_filters.FilterSet):
    """
    Filter cho Attempt API.

    Ví dụ sử dụng:
      GET /api/attempts/?status=ongoing
      GET /api/attempts/?quiz=1
      GET /api/attempts/?user=2
      GET /api/attempts/?score__gte=7.0
      GET /api/attempts/?started_at__gte=2025-01-01&started_at__lte=2025-12-31
      GET /api/attempts/?username=student1     ← tìm theo username
    """

    # Lọc theo username của người làm bài
    username = django_filters.CharFilter(
        field_name="user__username",
        lookup_expr="icontains",
        label="Tìm theo username",
    )

    # Lọc theo tên quiz
    quiz_title = django_filters.CharFilter(
        field_name="quiz__title",
        lookup_expr="icontains",
        label="Tìm theo tên quiz",
    )

    # Lọc theo khoảng điểm
    score_min = django_filters.NumberFilter(
        field_name="score",
        lookup_expr="gte",
        label="Điểm tối thiểu (>=)",
    )
    score_max = django_filters.NumberFilter(
        field_name="score",
        lookup_expr="lte",
        label="Điểm tối đa (<=)",
    )

    # Lọc theo khoảng thời gian bắt đầu
    started_after = django_filters.DateTimeFilter(
        field_name="started_at",
        lookup_expr="gte",
        label="Bắt đầu sau ngày (>=)",
    )
    started_before = django_filters.DateTimeFilter(
        field_name="started_at",
        lookup_expr="lte",
        label="Bắt đầu trước ngày (<=)",
    )

    class Meta:
        model = Attempt
        fields = {
            "id":     ["exact", "in"],
            "user":   ["exact"],          # ?user=<id>
            "quiz":   ["exact"],          # ?quiz=<id>
            "status": ["exact"],          # ?status=ready | ongoing | completed
        }
