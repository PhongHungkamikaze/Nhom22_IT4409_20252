from rest_framework.permissions import BasePermission



class IsOwnerTeacher(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "author"):
            return obj.author == request.user
        if hasattr(obj, "quiz"):
            return obj.quiz.author == request.user
        return False
