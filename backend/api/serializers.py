from rest_framework import serializers
from .models import User, Event, TicketCategory, Booking, Payment, Cancellation, Refund

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'firebase_uid', 'is_admin']

class TicketCategorySerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    
    class Meta:
        model = TicketCategory
        fields = '__all__'
        read_only_fields = ['available_quantity']

class EventSerializer(serializers.ModelSerializer):
    ticket_categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    ticket_category = TicketCategorySerializer(read_only=True)
    ticket_category_id = serializers.PrimaryKeyRelatedField(
        queryset=TicketCategory.objects.all(), source='ticket_category', write_only=True
    )
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'status', 'booking_time']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class CancellationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cancellation
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'
