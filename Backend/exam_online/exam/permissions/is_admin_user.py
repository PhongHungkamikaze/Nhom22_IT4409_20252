from rest_framework.permissions import BasePermission

from ..models import UserRole


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.Admin
        )
