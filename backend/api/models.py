from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    poster_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class TicketCategory(models.Model):
    TIER_CHOICES = [
        ('REGULAR', 'Regular'),
        ('PREMIUM', 'Premium'),
        ('VIP', 'VIP'),
    ]
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_categories')
    tier = models.CharField(max_length=10, choices=TIER_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_quantity = models.PositiveIntegerField()
    available_quantity = models.PositiveIntegerField()

    class Meta:
        unique_together = ('event', 'tier')

    def __str__(self):
        return f"{self.event.title} - {self.tier}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    ticket_category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT, related_name='bookings')
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    booking_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.user.username}"

class Payment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded')
    ]
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    payment_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} for Booking #{self.booking.id}"

class Cancellation(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='cancellation')
    cancellation_time = models.DateTimeField(auto_now_add=True)
    penalty_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Cancellation for Booking #{self.booking.id}"

class Refund(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed')
    ]
    cancellation = models.OneToOneField(Cancellation, on_delete=models.CASCADE, related_name='refund')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    processed_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Refund #{self.id}"
