import firebase_admin
from firebase_admin import credentials, firestore
import os
from typing import Optional

# Global Firestore client
db: Optional[firestore.Client] = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global db
    
    # Clear any existing apps to prevent JWT signature issues
    for app in firebase_admin._apps.values():
        firebase_admin.delete_app(app)
    firebase_admin._apps.clear()
    
    # Try environment variables first (for production)
    if all([
        os.getenv("FIREBASE_PROJECT_ID"),
        os.getenv("FIREBASE_PRIVATE_KEY"),
        os.getenv("FIREBASE_CLIENT_EMAIL")
    ]):
        cred_dict = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    # Fallback to service account key file (for local development)
    elif os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    else:
        raise FileNotFoundError("Firebase credentials not found. Set environment variables or provide serviceAccountKey.json")
    
    db = firestore.client()
    return db

def get_db():
    """Get Firestore database instance"""
    global db
    if db is None:
        db = init_firebase()
    return db

def get_firebase_auth():
    """Get Firebase Auth instance - ensures Firebase is initialized"""
    if not firebase_admin._apps:
        init_firebase()
    from firebase_admin import auth
    return auth

# Collection names
COLLECTIONS = {
    "users": "users",
    "questions": "questions", 
    "surveys": "surveys",
    "survey_questions": "survey_questions",
    "survey_assignments": "survey_assignments",
    "survey_responses": "survey_responses",
    "client_admins": "client_admins"
}
