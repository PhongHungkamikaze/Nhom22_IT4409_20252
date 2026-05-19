import django_filters

from ..models import Notification


class NotificationFilter(django_filters.FilterSet):
    type__in = django_filters.BaseInFilter(field_name="type", lookup_expr="in")
    is_read = django_filters.BooleanFilter(method="filter_is_read")

    class Meta:
        model = Notification
        fields = {
            "id": ["exact", "in"],
            "type": ["exact"],
            "created_at": ["gte", "lte"],
        }

    def filter_is_read(self, qs, name, value):
        return qs.filter(read_at__isnull=not value)
