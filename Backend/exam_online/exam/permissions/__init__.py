from .is_student_user import IsStudentUser
from .is_teacher_user import IsTeacherUser
from .is_admin_user import IsAdminUser
from .mixin_permissions import PermissionMixin

__all__ = [
    "PermissionMixin",
    "IsStudentUser",
    "IsTeacherUser",
    "IsAdminUser",
]