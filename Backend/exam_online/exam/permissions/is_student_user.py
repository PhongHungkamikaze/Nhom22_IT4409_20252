from rest_framework.permissions import BasePermission

from ..models import UserRole


class IsStudentUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.Student
        )
