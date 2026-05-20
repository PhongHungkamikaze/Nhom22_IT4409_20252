import django_filters
from ..models import Answer

class AnswerFilter(django_filters.FilterSet):
    class Meta:
        model = Answer
        fields = {
            "id": ["exact", "in"],
            "attempt": ["exact"],
            "question": ["exact"],
        }
