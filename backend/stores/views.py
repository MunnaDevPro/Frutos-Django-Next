"""
stores/views.py — Full version with Admin CRUD

এই file টা তোমার existing stores/views.py replace করবে।
Admin endpoints গুলো IsAdminUser permission দিয়ে protect করা।
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import Store, StoreFeature, StoreAvailability, LeftoverPack
from .serializers import StoreListSerializer, StoreDetailSerializer


# ─── Public Views (unchanged) ─────────────────────────────────────────────────

class StoreListView(generics.ListAPIView):
    """GET /api/fulfillment/stores/ — public, active stores only"""
    permission_classes = [permissions.AllowAny]
    serializer_class   = StoreListSerializer

    def get_queryset(self):
        qs = (
            Store.objects
            .filter(is_active=True)
            .prefetch_related('features', 'availability', 'leftover_packs')
        )
        feature = self.request.query_params.get('feature')
        if feature:
            qs = qs.filter(features__feature=feature)
        return qs


class StoreDetailView(APIView):
    """GET /api/fulfillment/stores/<slug>/ — public"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        store = get_object_or_404(
            Store.objects.filter(is_active=True)
            .prefetch_related('features', 'availability', 'leftover_packs'),
            slug=slug,
        )
        return Response(StoreDetailSerializer(store, context={'request': request}).data)


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminStoreListCreateView(APIView):
    """
    GET  /api/fulfillment/stores/admin/       — all stores (including inactive)
    POST /api/fulfillment/stores/admin/       — create store
    """
    permission_classes = [permissions.IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        stores = (
            Store.objects.all()
            .prefetch_related('features', 'availability', 'leftover_packs')
            .order_by('order', 'name')
        )
        return Response(StoreListSerializer(stores, many=True, context={'request': request}).data)

    def post(self, request):
        import re
        from django.utils.text import slugify

        data = request.data
        name = data.get('name', '')
        slug = slugify(name)

        # Make slug unique
        if Store.objects.filter(slug=slug).exists():
            slug = f"{slug}-{Store.objects.count() + 1}"

        store = Store(
            slug         = slug,
            name         = data.get('name', ''),
            short_name   = data.get('short_name', ''),
            address      = data.get('address', ''),
            city         = data.get('city', ''),
            full_address = data.get('full_address', ''),
            phone        = data.get('phone', ''),
            open_time    = data.get('open_time', '08:00'),
            close_time   = data.get('close_time', '21:00'),
            map_link     = data.get('map_link', ''),
            provenance   = data.get('provenance', ''),
            is_active    = str(data.get('is_active', 'true')).lower() == 'true',
            order        = int(data.get('order', 0) or 0),
        )

        if 'image' in request.FILES:
            store.image = request.FILES['image']

        store.save()
        return Response(
            StoreListSerializer(store, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminStoreDetailView(APIView):
    """
    GET    /api/fulfillment/stores/<id>/  — single store (admin)
    PATCH  /api/fulfillment/stores/<id>/  — update store
    DELETE /api/fulfillment/stores/<id>/  — delete store
    """
    permission_classes = [permissions.IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def _get_store(self, pk):
        return get_object_or_404(
            Store.objects.prefetch_related('features', 'availability', 'leftover_packs'),
            pk=pk,
        )

    def get(self, request, pk):
        return Response(StoreListSerializer(self._get_store(pk), context={'request': request}).data)

    def patch(self, request, pk):
        store = self._get_store(pk)
        data  = request.data

        fields = ['name', 'short_name', 'address', 'city', 'full_address',
                  'phone', 'open_time', 'close_time', 'map_link', 'provenance']
        for f in fields:
            if f in data:
                setattr(store, f, data[f])

        if 'is_active' in data:
            store.is_active = str(data['is_active']).lower() == 'true'
        if 'order' in data:
            store.order = int(data['order'] or 0)
        if 'image' in request.FILES:
            store.image = request.FILES['image']

        store.save()
        return Response(StoreListSerializer(store, context={'request': request}).data)

    def delete(self, request, pk):
        self._get_store(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStoreFeaturesView(APIView):
    """
    PUT /api/fulfillment/stores/<id>/features/
    Body: { "features": ["leftoverPack", "organic"] }
    Replaces all features for this store.
    """
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        store    = get_object_or_404(Store, pk=pk)
        features = request.data.get('features', [])

        StoreFeature.objects.filter(store=store).delete()
        for f in features:
            StoreFeature.objects.create(store=store, feature=f)

        return Response({'features': features})


class AdminStoreAvailabilityView(APIView):
    """
    PUT /api/fulfillment/stores/<id>/availability/
    Body: { "availability": [{"category": "Fruits", "icon": "apple"}, ...] }
    Replaces all availability entries for this store.
    """
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        store        = get_object_or_404(Store, pk=pk)
        availability = request.data.get('availability', [])

        StoreAvailability.objects.filter(store=store).delete()
        for i, item in enumerate(availability):
            StoreAvailability.objects.create(
                store    = store,
                category = item.get('category', ''),
                icon     = item.get('icon', 'shopping-basket'),
                order    = i,
            )

        return Response({'availability': availability})