import json
import logging

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

logger = logging.getLogger(__name__)

class ExamConsumer(WebsocketConsumer):
    def connect(self):
        self.attempt_id = self.scope["url_route"]["kwargs"].get("attempt_id")
        self.room_group_name = f"exam_{self.attempt_id}"
        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            self.close()
            return

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name, self.channel_name
            )

    def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get("type") == "violation":
                self.handle_violation(data)
        except Exception:
            pass

    def handle_violation(self, data):
        user = self.scope["user"]
        reason = data.get("reason", "Phát hiện chuyển tab/thu nhỏ cửa sổ")
        
        try:
            from exam.models import Attempt, NotificationType
            from exam.tasks import create_notifications

            attempt_db = Attempt.objects.select_related("quiz").get(id=self.attempt_id)
            teacher_id = attempt_db.quiz.author_id

            create_notifications.delay(
                recipient_ids=[teacher_id],
                title=f"Vi phạm phòng thi: {user.username}",
                content=f"Sinh viên {user.username} đã vi phạm: {reason} trong bài thi '{attempt_db.quiz.title}'",
                type=NotificationType.EXAM_VIOLATION,
                actor_id=user.id,
                data={
                    "attempt_id": attempt_db.id,
                    "quiz_id": attempt_db.quiz.id,
                    "reason": reason,
                },
            )
        except Exception as e:
            logger.error(f"Error processing violation for {user.username}: {str(e)}")

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "exam_violation_alert",
                "user": user.username,
                "reason": reason,
            },
        )

    def exam_violation_alert(self, event):
        self.send(text_data=json.dumps({
            "type": "violation_alert",
            "user": event["user"],
            "reason": event["reason"],
        }))
