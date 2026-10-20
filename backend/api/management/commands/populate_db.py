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
                "title": "Annual College Cultural Fest",
                "description": "The flagship annual cultural extravaganza featuring inter-department dance battles, classical music, drama, fashion walks, and food stalls.",
                "category": "Cultural Fest",
                "organizer": "Host: Fine Arts Club",
                "location": "Main Auditorium",
                "start_time": now + timedelta(days=12),
                "end_time": now + timedelta(days=14),
                "poster_url": "/assets/events/comedy-night.jpg",
                "regular_price": 0.00,
                "premium_price": 10.00,
                "vip_price": 25.00,
            },
            {
                "title": "36-Hour Campus Hackathon",
                "description": "Collaborate in teams of 4 to design, code, and deploy solutions for real-world campus and social challenges with mentorship from industry tech leads.",
                "category": "Tech & Hackathons",
                "organizer": "Host: IEEE Student Branch",
                "location": "Main Auditorium & Tech Hall",
                "start_time": now + timedelta(days=18),
                "end_time": now + timedelta(days=20),
                "poster_url": "/assets/events/tech-summit.jpg",
                "regular_price": 10.00,
                "premium_price": 20.00,
                "vip_price": 40.00,
            },
            {
                "title": "Inter-College Sports Meet",
                "description": "Annual athletics and sports championship spanning basketball, football, volleyball, track events, and badminton across universities.",
                "category": "Sports",
                "organizer": "Host: Sports Committee",
                "location": "Sports Arena",
                "start_time": now + timedelta(days=7),
                "end_time": now + timedelta(days=10),
                "poster_url": "/assets/events/marathon.jpg",
                "regular_price": 10.00,
                "premium_price": 15.00,
                "vip_price": 30.00,
            },
            {
                "title": "Music Band Night",
                "description": "Live open-air concert featuring campus rock bands, indie acoustic singers, and guest DJ headliners at the campus amphitheater.",
                "category": "Cultural Fest",
                "organizer": "Host: Music Society",
                "location": "Music Grounds",
                "start_time": now + timedelta(days=4),
                "end_time": now + timedelta(days=4, hours=5),
                "poster_url": "/assets/events/summer-fest.jpg",
                "regular_price": 10.00,
                "premium_price": 25.00,
                "vip_price": 50.00,
            },
            {
                "title": "Robotics & AI Workshop",
                "description": "Hands-on masterclass on embedded microcontrollers, computer vision with OpenCV, and training edge machine learning models for autonomous bots.",
                "category": "Workshops",
                "organizer": "Host: ACM Student Chapter",
                "location": "Seminar Hall B",
                "start_time": now + timedelta(days=21),
                "end_time": now + timedelta(days=22),
                "poster_url": "/assets/events/startup-pitch.jpg",
                "regular_price": 5.00,
                "premium_price": 15.00,
                "vip_price": 30.00,
            }
        ]

        for ev_data in events:
            reg_price = ev_data.pop("regular_price")
            prem_price = ev_data.pop("premium_price")
            vip_price = ev_data.pop("vip_price")
            
            event = Event.objects.create(**ev_data)
            
            TicketCategory.objects.create(
                event=event, tier='REGULAR', price=reg_price, 
                total_quantity=200, available_quantity=200
            )
            TicketCategory.objects.create(
                event=event, tier='PREMIUM', price=prem_price, 
                total_quantity=50, available_quantity=50
            )
            TicketCategory.objects.create(
                event=event, tier='VIP', price=vip_price, 
                total_quantity=15, available_quantity=15
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated campus events with ticket tiers.'))
