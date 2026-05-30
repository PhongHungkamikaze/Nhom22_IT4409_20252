import django_filters
from ..models import ClassGroup


class ClassGroupFilter(django_filters.FilterSet):
    class Meta:
        model = ClassGroup
        fields = {
            "id": ["exact", "in"],
            "name": ["exact", "icontains"],
            "subject": ["exact"],
            "created_by": ["exact"],
        }
