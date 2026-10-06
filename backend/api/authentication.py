from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials
from .models import User
from django.conf import settings
import os

# Initialize Firebase Admin
firebase_creds_path = os.getenv('FIREBASE_ADMIN_CREDENTIALS_PATH')
if firebase_creds_path and os.path.exists(firebase_creds_path):
    cred = credentials.Certificate(firebase_creds_path)
    firebase_admin.initialize_app(cred)
else:
    # Fallback for development without a service account JSON, 
    # though it might fail if default app isn't found.
    try:
        firebase_admin.initialize_app()
    except ValueError:
        pass

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        auth_header = auth_header.split()
        if len(auth_header) != 2 or auth_header[0].lower() != 'bearer':
            return None
            
        id_token = auth_header[1]
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token.get('uid')
            email = decoded_token.get('email')
        except Exception as e:
            raise AuthenticationFailed(f'Invalid Firebase token: {str(e)}')
            
        user, created = User.objects.get_or_create(firebase_uid=uid, defaults={
            'username': email.split('@')[0] if email else uid,
            'email': email or ''
        })
        
        return (user, None)
