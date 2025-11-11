from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from typing import List, Optional
import uvicorn

from models.database import init_firebase
from routers import users, questions, surveys, assignments, deletion
from firebase_admin import auth as firebase_auth
from middleware.auth import verify_firebase_token, get_current_user_email

# Initialize FastAPI app
app = FastAPI(
    title="Survey App API",
    description="FastAPI backend for Survey Application",
    version="1.0.0"
)

# CORS middleware
allowed_origins = [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://v-survey-app.netlify.app",
    "*"  # Allow all origins for development
]

# Add environment-based origins
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
init_firebase()

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(surveys.router, prefix="/api/surveys", tags=["surveys"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["assignments"])
app.include_router(deletion.router, prefix="/api/delete", tags=["deletion"])

@app.get("/api/test-user/{user_id}")
async def test_user_exists(user_id: str):
    """Test if user exists in Firebase Auth"""
    try:
        user = firebase_auth.get_user(user_id)
        return {"success": True, "exists": True, "email": user.email}
    except firebase_auth.UserNotFoundError:
        return {"success": True, "exists": False}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/delete-user/{user_id}")
async def delete_client_from_auth(user_id: str):
    """Delete client from Firebase Authentication using Admin SDK"""
    try:
        # First check if user exists
        try:
            user = firebase_auth.get_user(user_id)
            print(f"Found user: {user.email} with UID: {user_id}")
        except firebase_auth.UserNotFoundError:
            return {"success": False, "message": "User not found in Firebase Auth", "error": "USER_NOT_FOUND"}
        
        # Delete the user
        firebase_auth.delete_user(user_id)
        print(f"Successfully deleted user with UID: {user_id}")
        return {"success": True, "message": "User deleted from Firebase Auth"}
    except firebase_auth.UserNotFoundError:
        return {"success": False, "message": "User not found in Firebase Auth", "error": "USER_NOT_FOUND"}
    except Exception as e:
        print(f"Error deleting user {user_id}: {str(e)}")
        return {"success": False, "message": f"Failed to delete user: {str(e)}", "error": "DELETION_FAILED"}

@app.get("/")
async def root():
    return {"message": "Survey App API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
