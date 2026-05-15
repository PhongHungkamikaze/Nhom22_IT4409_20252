from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/exam/<int:attempt_id>/", consumers.ExamConsumer.as_asgi()),
]
