import django_filters
from django_filters import BaseInFilter, NumberFilter
from ..models import Quiz

class NumberInFilter(BaseInFilter, NumberFilter):
    pass

class QuizFilter(django_filters.FilterSet):
    author__in = NumberInFilter(field_name="author", lookup_expr="in")
    subject__in = NumberInFilter(field_name="subject", lookup_expr="in")

    class Meta:
        model = Quiz
        fields = {
            "id": ["exact", "in"],
            "title": ["exact", "icontains"],
            "author": ["exact"],
            "is_published": ["exact"],
            "created_at": ["exact", "gte", "lte"],
            "time_limit": ["exact", "gte", "lte"],
            "subject": ["exact"],
            "end_time": ["exact", "gte", "lte"],
        }
