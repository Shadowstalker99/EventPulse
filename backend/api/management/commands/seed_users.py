from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Seeds 3 student/customer logins and 1 admin login'

    def handle(self, *args, **kwargs):
        accounts = [
            {
                "username": "admin_sarah",
                "email": "admin@campus.edu",
                "password": "AdminPass123!",
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "is_admin": True,
                "is_staff": True,
                "is_superuser": True,
                "firebase_uid": "local_admin_sarah_uid"
            },
            {
                "username": "alex_chen",
                "email": "alex.chen@student.edu",
                "password": "StudentPass123!",
                "first_name": "Alex",
                "last_name": "Chen",
                "is_admin": False,
                "is_staff": False,
                "is_superuser": False,
                "firebase_uid": "local_alex_chen_uid"
            },
            {
                "username": "priya_sharma",
                "email": "priya.sharma@student.edu",
                "password": "StudentPass123!",
                "first_name": "Priya",
                "last_name": "Sharma",
                "is_admin": False,
                "is_staff": False,
                "is_superuser": False,
                "firebase_uid": "local_priya_sharma_uid"
            },
            {
                "username": "marcus_vance",
                "email": "marcus.vance@student.edu",
                "password": "StudentPass123!",
                "first_name": "Marcus",
                "last_name": "Vance",
                "is_admin": False,
                "is_staff": False,
                "is_superuser": False,
                "firebase_uid": "local_marcus_vance_uid"
            }
        ]

        created_count = 0
        for acc in accounts:
            password = acc.pop("password")
            user, created = User.objects.get_or_create(username=acc["username"], defaults=acc)
            user.email = acc["email"]
            user.first_name = acc["first_name"]
            user.last_name = acc["last_name"]
            user.is_admin = acc["is_admin"]
            user.is_staff = acc["is_staff"]
            user.is_superuser = acc["is_superuser"]
            user.firebase_uid = acc["firebase_uid"]
            user.set_password(password)
            user.save()
            created_count += 1
            role = "Admin" if user.is_admin else "Customer (Student)"
            self.stdout.write(self.style.SUCCESS(f"Saved {role}: {user.email} (Username: {user.username})"))

        self.stdout.write(self.style.SUCCESS(f"Successfully configured {created_count} user accounts."))
