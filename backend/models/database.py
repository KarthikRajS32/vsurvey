import firebase_admin
from firebase_admin import credentials, firestore
import os
from typing import Optional

# Global Firestore client
db: Optional[firestore.Client] = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global db
    
    if not firebase_admin._apps:
        # Use service account key file or default credentials
        if os.path.exists("serviceAccountKey.json"):
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (for production)
            firebase_admin.initialize_app()
    
    db = firestore.client()
    return db

def get_db():
    """Get Firestore database instance"""
    global db
    if db is None:
        db = init_firebase()
    return db

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
