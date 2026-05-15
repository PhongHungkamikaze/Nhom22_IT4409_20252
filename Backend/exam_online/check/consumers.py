import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


class ExamConsumer(WebsocketConsumer):
    def connect(self):
        self.attempt_id = self.scope['url_route']['kwargs'].get('attempt_id', 'global')
        self.room_group_name = f"exam_{self.attempt_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")
        
        if message_type == "violation":
            # Handle tab switching or other violations
            username = self.scope["user"].username if self.scope["user"].is_authenticated else "Anonymous"
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, 
                {
                    "type": "exam_violation", 
                    "user": username,
                    "reason": data.get("reason", "Tab switching detected")
                }
            )

    def exam_violation(self, event):
        self.send(text_data=json.dumps({
            "type": "violation_alert",
            "user": event["user"],
            "reason": event["reason"]
        }))
