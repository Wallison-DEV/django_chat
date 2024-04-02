from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import async_to_sync

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user_id = self.scope["session"]["_auth_user_id"]
        self.group_name = "{}".format(user_id)
        # Join room group

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '')
            user = self.scope["user"].username
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'receive_group_message',
                    'message': message,
                    'user': user
                }
            )
            await self.send(text_data=json.dumps({
                'message': message,
                'user': user
            }))
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
        except Exception as e:
            print(f"Error processing message: {e}")

    async def receive_group_message(self, event):
        message = event['message']

        await self.send(
            text_data=json.dumps({
            'message': message
        }))
