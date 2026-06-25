from django.urls import path
from .views import LiveChatUsersView, LiveChatHistoryView

urlpatterns = [
    path('contacts/', LiveChatUsersView.as_view(), name='livechat_contacts'),
    path('history/<int:user_id>/', LiveChatHistoryView.as_view(), name='livechat_history'),
]
