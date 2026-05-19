"""
ASGI config for exam_online project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from check.middleware import JwtAuthMiddlewareStack
import check.routing


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "exam_online.settings")
application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            JwtAuthMiddlewareStack(URLRouter(check.routing.websocket_urlpatterns))
        ),
    }
)
