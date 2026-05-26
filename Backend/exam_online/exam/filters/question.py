import django_filters
from django_filters import BaseInFilter, NumberFilter
from ..models import Question


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class QuestionFilter(django_filters.FilterSet):
    subject__in = NumberInFilter(field_name="subject", lookup_expr="in")
    author__in = NumberInFilter(field_name="author", lookup_expr="in")

    class Meta:
        model = Question
        fields = {
            "id": ["exact", "in"],
            "type": ["exact", "icontains"],
            "content": ["exact", "icontains"],
            "quizzes": ["exact", "in"],
        }

