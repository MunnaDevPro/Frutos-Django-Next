from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Max, Count
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()

class LiveChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get users who have exchanged messages with the current user
        messages = ChatMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )
        
        user_ids = set(messages.values_list('sender_id', flat=True)) | set(messages.values_list('receiver_id', flat=True))
        if user.id in user_ids:
            user_ids.remove(user.id)
            
        # If the user is a STAFF, ensure ADMIN is in the list even if no messages yet
        if user.user_type == 'STAFF' or getattr(user, 'is_staff', False):
            # Find an admin
            admin = User.objects.filter(user_type='ADMIN').first()
            if admin and admin.id not in user_ids:
                user_ids.add(admin.id)
                
        users = User.objects.filter(id__in=user_ids)
        
        data = []
        for u in users:
            # Get last message
            last_message = ChatMessage.objects.filter(
                (Q(sender=user, receiver=u) | Q(sender=u, receiver=user))
            ).order_by('-created_at').first()
            
            # Get unread count
            unread_count = ChatMessage.objects.filter(
                sender=u, receiver=user, is_read=False
            ).count()
            
            # Get store/shop info if it's a staff
            store_name = None
            if hasattr(u, 'staff_profile') and u.staff_profile and u.staff_profile.store:
                store_name = u.staff_profile.store.name
            
            data.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'user_type': u.user_type,
                'store_name': store_name,
                'last_message': last_message.text if last_message else None,
                'last_message_time': last_message.created_at if last_message else None,
                'unread_count': unread_count
            })
            
        # Sort by last message time
        data.sort(key=lambda x: x['last_message_time'].isoformat() if x['last_message_time'] else "", reverse=True)
        return Response(data)

class LiveChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user
        
        # Mark messages as read
        ChatMessage.objects.filter(
            sender_id=user_id,
            receiver=user,
            is_read=False
        ).update(is_read=True)
        
        messages = ChatMessage.objects.filter(
            Q(sender=user, receiver_id=user_id) | Q(sender_id=user_id, receiver=user)
        ).order_by('created_at')
        
        data = []
        for msg in messages:
            data.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'text': msg.text,
                'created_at': msg.created_at,
                'is_read': msg.is_read
            })
            
        return Response(data)
