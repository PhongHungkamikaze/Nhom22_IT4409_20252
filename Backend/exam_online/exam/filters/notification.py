import django_filters
from ..models import Notification


class NotificationFilter(django_filters.FilterSet):
    is_read = django_filters.BooleanFilter(method="filter_is_read")

    class Meta:
        model = Notification
        fields = {
            "id": ["exact", "in"],
            "type": ["exact", "icontains"],
            "recipient": ["exact", "in"],
            "actor": ["exact", "in"],
            "created_at": ["exact", "gte", "lte"],
        }

    def filter_is_read(self, queryset, name, value):
        if value:
            return queryset.filter(read_at__isnull=False)
        return queryset.filter(read_at__isnull=True)
