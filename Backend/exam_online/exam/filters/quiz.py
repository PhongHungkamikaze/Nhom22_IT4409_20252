import django_filters

from ..models import Quiz


class QuizFilter(django_filters.FilterSet):
    author_username = django_filters.CharFilter(
        field_name="author__username", lookup_expr="icontains"
    )

    class Meta:
        model = Quiz
        fields = {
            "id": ["exact", "in"],
            "author": ["exact"],
            "created_at": ["exact", "gte", "lte"],
        }
