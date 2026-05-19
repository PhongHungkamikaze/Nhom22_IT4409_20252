from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except (User.DoesNotExist, ValueError):
        return AnonymousUser()

class JwtAuthMiddleware:
    """
    Middleware tối giản: Lấy User từ ID truyền trực tiếp trong URL Path.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Lấy user_id từ URL: /ws/exam/<attempt_id>/<user_id>/
        path = scope.get("path", "")
        parts = path.strip("/").split("/")
        
        user_id = None
        if len(parts) >= 4 and parts[1] == "exam":
            user_id = parts[3]

        if user_id and user_id != 'anonymous':
            scope["user"] = await get_user(user_id)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)
