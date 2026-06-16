from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/ticket/(?P<ticket_id>\w+)/$', consumers.TicketChatConsumer.as_asgi()),
]
