import django_filters
from ..models import Attempt

class AttemptFilter(django_filters.FilterSet):
    class Meta:
        model = Attempt
        fields = {
            "id": ["exact", "in"],
            "user": ["exact"],
            "quiz": ["exact"],
            "status": ["exact"],
            "started_at": ["exact", "gte", "lte"],
            "score": ["exact", "gte", "lte"],
        }
