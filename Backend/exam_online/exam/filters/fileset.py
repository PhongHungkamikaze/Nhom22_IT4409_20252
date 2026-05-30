import django_filters
from ..models import FileSet


class FileSetFilter(django_filters.FilterSet):
    class Meta:
        model = FileSet
        fields = {
            "id": ["exact", "in"],
            "name": ["exact", "icontains"],
            "subject": ["exact"],
            "uploaded_by": ["exact"],
        }
