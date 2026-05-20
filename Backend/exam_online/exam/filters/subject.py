import django_filters
from ..models import Subject

class SubjectFilter(django_filters.FilterSet):
    class Meta:
        model = Subject
        fields = {
            "id": ["exact", "in"],
            "name": ["exact", "icontains"],
        }
