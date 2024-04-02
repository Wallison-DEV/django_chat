from django.contrib.auth.models import User
from django.db.models import Model, TextField, DateTimeField, ForeignKey, CASCADE

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class MessageModel(Model):
    user = ForeignKey(User, on_delete=CASCADE, verbose_name='user', related_name='from_user', db_index=True)
    recipient = ForeignKey(User, on_delete=CASCADE, verbose_name='recipient', related_name='to_user', db_index=True)
    timestamp = DateTimeField('timestamp', auto_now_add=True, editable=False, db_index=True)
    body = TextField('body')

    def __str__(self):
        return str(self.id)

    def characters(self):
        return len(self.body)

    def notify_ws_clients(self):
        notification = {
            'type': 'receive_group_message',
            'message': '{}'.format(self.id)
        }

        channel_layer = get_channel_layer()
        print("user.id {}".format(self.user.id))
        print("user.id {}".format(self.recipient.id))

        async_to_sync(channel_layer.group_send)("{}".format(self.user.id), notification)
        async_to_sync(channel_layer.group_send)("{}".format(self.recipient.id), notification)

    def save(self, *args, **kwargs):
        new_instance = self.pk is None  # Verifica se é uma nova instância
        self.body = self.body.strip()
        super(MessageModel, self).save(*args, **kwargs)
        if new_instance:
            self.notify_ws_clients()

    class Meta:
        app_label = 'chat'
        verbose_name = 'message'
        verbose_name_plural = 'messages'
        ordering = ('timestamp',)
