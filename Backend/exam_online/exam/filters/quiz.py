import django_filters
from ..models import Quiz

class QuizFilter(django_filters.FilterSet):
    class Meta:
        model = Quiz
        fields = {
            "id": ["exact", "in"],
            "title": ["exact", "icontains"],
            "author": ["exact", "in"],
            "is_published": ["exact"],
            "created_at": ["exact", "gte", "lte"],
            "time_limit": ["exact", "gte", "lte"],
            "subject": ["exact", "in"],
            "end_time": ["exact", "gte", "lte"],
        }
