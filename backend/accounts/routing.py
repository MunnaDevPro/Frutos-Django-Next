from django.urls import re_path
from . import consumers
from livechat.consumers import LiveChatConsumer
from staff.consumers import AnnouncementConsumer
websocket_urlpatterns = [
    re_path(r'ws/chat/ticket/(?P<ticket_id>\w+)/$', consumers.TicketChatConsumer.as_asgi()),
    re_path(r'ws/livechat/$', LiveChatConsumer.as_asgi()),
    re_path(r'ws/announcements/$', AnnouncementConsumer.as_asgi()),
]
