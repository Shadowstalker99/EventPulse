from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import User, Event, TicketCategory, Booking, Payment, Cancellation, Refund
from .serializers import (
    UserSerializer, EventSerializer, TicketCategorySerializer, 
    BookingSerializer, PaymentSerializer, CancellationSerializer
)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-start_time')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class TicketCategoryViewSet(viewsets.ModelViewSet):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(available_quantity=serializer.validated_data['total_quantity'])

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Booking.objects.all().order_by('-booking_time')
        return Booking.objects.filter(user=self.request.user).order_by('-booking_time')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Expects: ticket_category_id, quantity
        ticket_category_id = request.data.get('ticket_category_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            return Response({'detail': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)

        # Lock the row for update
        try:
            category = TicketCategory.objects.select_for_update().get(id=ticket_category_id)
        except TicketCategory.DoesNotExist:
            return Response({'detail': 'Ticket category not found.'}, status=status.HTTP_404_NOT_FOUND)

        if category.available_quantity < quantity:
            return Response(
                {'detail': f'Sorry, only {category.available_quantity} {category.tier} tickets remaining.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate Price
        total_price = category.price * quantity

        # Update Inventory
        category.available_quantity -= quantity
        category.save()

        # Create Booking
        booking = Booking.objects.create(
            user=request.user,
            ticket_category=category,
            quantity=quantity,
            total_price=total_price,
            status='CONFIRMED'  # Simulating immediate test payment success
        )

        # Create Payment Record
        Payment.objects.create(
            booking=booking,
            amount=total_price,
            status='SUCCESS',
            transaction_id=f"txn_{booking.id}_{timezone.now().timestamp()}"
        )

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()

        if booking.status != 'CONFIRMED':
            return Response({'detail': 'Only confirmed bookings can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        event = booking.ticket_category.event
        now = timezone.now()

        if now >= event.start_time:
            return Response({'detail': 'Event deadline passed. Cannot cancel.'}, status=status.HTTP_400_BAD_REQUEST)

        time_diff = event.start_time - now
        days_before = time_diff.total_seconds() / 86400

        if days_before > 7:
            penalty_pct = Decimal('0.05')
        elif 3 < days_before <= 7:
            penalty_pct = Decimal('0.15')
        elif 1 <= days_before <= 3:
            penalty_pct = Decimal('0.30')
        elif days_before < 1:
            penalty_pct = Decimal('0.50')
        else:
            penalty_pct = Decimal('1.00')

        penalty_amount = booking.total_price * penalty_pct
        refund_amount = booking.total_price - penalty_amount

        with transaction.atomic():
            # Lock the ticket category to safely increment
            category = TicketCategory.objects.select_for_update().get(id=booking.ticket_category.id)
            category.available_quantity += booking.quantity
            category.save()

            # Mark booking cancelled
            booking.status = 'CANCELLED'
            booking.save()

            cancellation = Cancellation.objects.create(
                booking=booking,
                penalty_percentage=penalty_pct * 100,
                penalty_amount=penalty_amount,
                refund_amount=refund_amount
            )

            Refund.objects.create(
                cancellation=cancellation,
                amount=refund_amount,
                status='PROCESSED'
            )

        return Response({
            'detail': 'Cancellation successful.',
            'penalty_percentage': f"{penalty_pct * 100}%",
            'penalty_amount': penalty_amount,
            'refund_amount': refund_amount
        }, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_revenue = sum(p.amount for p in Payment.objects.filter(status='SUCCESS'))
        tickets_sold = sum(b.quantity for b in Booking.objects.filter(status='CONFIRMED'))
        total_events = Event.objects.count()
        return Response({
            'total_revenue': total_revenue,
            'tickets_sold': tickets_sold,
            'total_events': total_events
        })
