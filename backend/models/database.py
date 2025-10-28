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
    
    # Use service account key file
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    else:
        raise FileNotFoundError("serviceAccountKey.json not found")
    
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
