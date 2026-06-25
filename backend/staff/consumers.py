import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class AnnouncementConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        
        if not user.is_authenticated:
            await self.close()
            return

        self.groups_joined = []

        # All staff join their own personal group
        user_group = f"user_{user.id}"
        await self.channel_layer.group_add(user_group, self.channel_name)
        self.groups_joined.append(user_group)

        # They also join 'staff_all' and their specific 'store_{id}' group
        user_type = getattr(user, 'user_type', '')
        
        if user_type == 'ADMIN' or getattr(user, 'is_superuser', False):
            # Admins join the global group to see testing/broadcasts if needed
            await self.channel_layer.group_add("staff_all", self.channel_name)
            self.groups_joined.append("staff_all")
        else:
            # Staff join global and their store
            await self.channel_layer.group_add("staff_all", self.channel_name)
            self.groups_joined.append("staff_all")
            
            store_id = await self.get_staff_store_id(user)
            if store_id:
                store_group = f"store_{store_id}"
                await self.channel_layer.group_add(store_group, self.channel_name)
                self.groups_joined.append(store_group)

        await self.accept()

    async def disconnect(self, close_code):
        for group in getattr(self, 'groups_joined', []):
            await self.channel_layer.group_discard(group, self.channel_name)

    async def send_announcement(self, event):
        announcement = event['announcement']
        await self.send(text_data=json.dumps({
            'type': 'new_announcement',
            'data': announcement
        }))

    @database_sync_to_async
    def get_staff_store_id(self, user):
        from .models import StaffProfile
        try:
            profile = StaffProfile.objects.get(user=user)
            return profile.store_id
        except StaffProfile.DoesNotExist:
            return None
