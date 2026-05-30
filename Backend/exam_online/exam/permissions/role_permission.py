from rest_framework.permissions import BasePermission

from ..models import UserRole


class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsAdminUser(RolePermission):
    allowed_roles = [UserRole.Admin]


class IsTeacherUser(RolePermission):
    allowed_roles = [UserRole.Teacher]


class IsStudentUser(RolePermission):
    allowed_roles = [UserRole.Student]


class IsStaff(RolePermission):
    allowed_roles = [UserRole.Admin, UserRole.Teacher]


class IsOwnerTeacher(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "author"):
            return obj.author == request.user
        if hasattr(obj, "quiz"):
            return obj.quiz.author == request.user
        return False
