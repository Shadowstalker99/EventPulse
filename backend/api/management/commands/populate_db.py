from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Event, TicketCategory

class Command(BaseCommand):
    help = 'Populates the database with sample events'

    def handle(self, *args, **kwargs):
        Event.objects.all().delete()
        now = timezone.now()
        
        events = [
            {
                "title": "Tech Conference 2026",
                "description": "Annual tech meetup with industry leaders.",
                "location": "San Francisco, CA",
                "start_time": now + timedelta(days=30),
                "end_time": now + timedelta(days=32),
                "poster_url": "https://via.placeholder.com/600x400?text=Tech+Conf",
            },
            {
                "title": "Summer Music Festival",
                "description": "3-day outdoor music festival.",
                "location": "Austin, TX",
                "start_time": now + timedelta(days=15),
                "end_time": now + timedelta(days=18),
                "poster_url": "https://via.placeholder.com/600x400?text=Music+Fest",
            },
            {
                "title": "Local Comedy Night",
                "description": "Stand-up comedy at the downtown club.",
                "location": "New York, NY",
                "start_time": now + timedelta(days=2),
                "end_time": now + timedelta(days=2, hours=3),
                "poster_url": "https://via.placeholder.com/600x400?text=Comedy+Night",
            },
            {
                "title": "Startup Pitch Deck",
                "description": "Watch new startups pitch their ideas to investors.",
                "location": "Seattle, WA",
                "start_time": now + timedelta(days=5),
                "end_time": now + timedelta(days=5, hours=4),
                "poster_url": "https://via.placeholder.com/600x400?text=Startup+Pitch",
            },
            {
                "title": "Marathon 2026",
                "description": "City wide marathon event.",
                "location": "Chicago, IL",
                "start_time": now + timedelta(days=60),
                "end_time": now + timedelta(days=60, hours=8),
                "poster_url": "https://via.placeholder.com/600x400?text=Marathon",
            }
        ]

        for ev_data in events:
            event = Event.objects.create(**ev_data)
            
            TicketCategory.objects.create(
                event=event, tier='REGULAR', price=50.00, 
                total_quantity=200, available_quantity=200
            )
            TicketCategory.objects.create(
                event=event, tier='PREMIUM', price=100.00, 
                total_quantity=50, available_quantity=50
            )
            TicketCategory.objects.create(
                event=event, tier='VIP', price=250.00, 
                total_quantity=10, available_quantity=10
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated 5 events with ticket tiers.'))
