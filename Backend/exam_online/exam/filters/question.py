import django_filters
from ..models import Question

class QuestionFilter(django_filters.FilterSet):
    class Meta:
        model = Question
        fields = {
            "id": ["exact", "in"],
            "type": ["exact", "icontains"],
            "content": ["exact", "icontains"],
            "author": ["exact"],
            "subject": ["exact", "in"],
            "quizzes": ["exact", "in"],
        }
