import django_filters
from django_filters import BaseInFilter, NumberFilter
from ..models import Question


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class QuestionFilter(django_filters.FilterSet):
    class Meta:
        model = Question
        fields = {
            "id": ["exact", "in"],
            "type": ["exact", "icontains"],
            "content": ["exact", "icontains"],
            "author": ["exact", "in"],
            "subject": ["exact", "in"],
            "quizzes": ["exact", "in"],
        }
