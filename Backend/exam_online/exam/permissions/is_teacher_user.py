from rest_framework.permissions import BasePermission

from ..models import UserRole


class IsTeacherUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.Teacher
        )
