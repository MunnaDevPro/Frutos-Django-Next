"""
stores/urls.py — Updated with Admin CRUD routes

Mount in root urls.py:
    path('api/fulfillment/', include('stores.urls')),
"""
from django.urls import path
from .views import (
    StoreListView, StoreDetailView,
    AdminStoreListCreateView, AdminStoreDetailView,
    AdminStoreFeaturesView, AdminStoreAvailabilityView,
)

urlpatterns = [
    # ── Public ───────────────────────────────────────────────
    path('stores/',              StoreListView.as_view(),   name='store-list'),
    path('stores/<slug:slug>/',  StoreDetailView.as_view(), name='store-detail'),

    # ── Admin CRUD ────────────────────────────────────────────
    path('stores/admin/',                              AdminStoreListCreateView.as_view(), name='admin-store-list'),
    path('stores/<int:pk>/',                           AdminStoreDetailView.as_view(),     name='admin-store-detail'),
    path('stores/<int:pk>/features/',                  AdminStoreFeaturesView.as_view(),   name='admin-store-features'),
    path('stores/<int:pk>/availability/',              AdminStoreAvailabilityView.as_view(), name='admin-store-availability'),
]