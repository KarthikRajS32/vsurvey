from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from typing import List, Optional
import uvicorn

from models.database import init_firebase
from routers import users, questions, surveys, assignments
from firebase_admin import auth as firebase_auth
from middleware.auth import verify_firebase_token

# Initialize FastAPI app
app = FastAPI(
    title="Survey App API",
    description="FastAPI backend for Survey Application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
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

@app.delete("/api/users/{uid}/auth")
async def delete_user_from_auth(uid: str, current_user_email: str = Depends(verify_firebase_token)):
    """Delete user from Firebase Authentication"""
    try:
        firebase_auth.delete_user(uid)
        return {"success": True, "message": "User deleted from Firebase Authentication"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user from Firebase Auth: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Survey App API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
