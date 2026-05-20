import django_filters
from ..models import User

class UserFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {
            "id": ["exact", "in"],
            "username": ["exact", "icontains"],
            "email": ["exact", "icontains"],
            "role": ["exact"],
            "is_active": ["exact"],
        }
