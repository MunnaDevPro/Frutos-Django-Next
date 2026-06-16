from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import SupportTicketMessageSerializer

import threading

def _send_broadcast(channel_layer, group_name, message_data):
    try:
        from asgiref.sync import async_to_sync
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'chat_message',
                'message': message_data
            }
        )
    except Exception as e:
        print(f"BROADCAST ERROR: {e}")

def broadcast_ticket_message(msg):
    channel_layer = get_channel_layer()
    if channel_layer:
        data = SupportTicketMessageSerializer(msg).data
        _send_broadcast(channel_layer, f'chat_ticket_{msg.ticket_id}', data)
