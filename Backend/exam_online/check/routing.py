from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # URL có dạng: ws/exam/<attempt_id>/<user_id>/
    re_path(
        r"ws/exam/(?P<attempt_id>\w+)/(?P<user_id>\w+)/?$",
        consumers.ExamConsumer.as_asgi(),
    ),
    re_path(
        r"ws/notifications/(?P<user_id>\w+)/?$",
        consumers.NotificationConsumer.as_asgi(),
    ),
]
