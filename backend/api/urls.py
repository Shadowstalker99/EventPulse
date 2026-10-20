from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, TicketCategoryViewSet, BookingViewSet, 
    CurrentUserView, LoginView, AdminStatsView
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'tickets', TicketCategoryViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
]
