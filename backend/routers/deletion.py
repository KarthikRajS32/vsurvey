"""Secure deletion endpoints using Firebase Admin SDK"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from services.firebase_admin_service import firebase_admin_service
from middleware.auth import verify_firebase_token, get_current_user_email
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class DeleteClientRequest(BaseModel):
    client_uid: str
    client_email: str

class DeleteUserRequest(BaseModel):
    user_uid: str
    user_email: str
    client_email: str

@router.delete("/client")
async def delete_client(
    request: DeleteClientRequest,
    current_user_email: str = Depends(get_current_user_email)
) -> Dict[str, Any]:
    """
    Delete client completely (SuperAdmin only)
    - Deletes from Firebase Auth
    - Deletes all Firestore documents and subcollections
    - Deletes all users created by this client
    """
    try:
        # Verify SuperAdmin permission
        if current_user_email != "superadmin@vsurvey.com":
            raise HTTPException(
                status_code=403, 
                detail="Only SuperAdmin can delete clients"
            )
        
        logger.info(f"SuperAdmin {current_user_email} deleting client {request.client_email}")
        
        result = await firebase_admin_service.delete_client_completely(
            request.client_uid, 
            request.client_email
        )
        
        success = result["auth_deleted"] and result["firestore_deleted"]
        
        return {
            "success": success,
            "message": "Client deletion completed" if success else "Client deletion partially failed",
            "details": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting client: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete client: {str(e)}")

@router.delete("/user")
async def delete_user(
    request: DeleteUserRequest,
    current_user_email: str = Depends(get_current_user_email)
) -> Dict[str, Any]:
    """
    Delete user completely (Client Admin only)
    - Deletes from Firebase Auth
    - Deletes all Firestore documents
    - Deletes survey responses and assignments
    """
    try:
        # Verify Client Admin permission (must be the client who created the user)
        if current_user_email != request.client_email:
            raise HTTPException(
                status_code=403, 
                detail="Only the client who created the user can delete them"
            )
        
        logger.info(f"Client {current_user_email} deleting user {request.user_email}")
        
        result = await firebase_admin_service.delete_user_completely(
            request.user_uid,
            request.user_email, 
            request.client_email
        )
        
        success = result["auth_deleted"] and result["firestore_deleted"]
        
        return {
            "success": success,
            "message": "User deletion completed" if success else "User deletion partially failed",
            "details": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

# Legacy endpoint for backward compatibility
@router.delete("/delete-user/{user_id}")
async def legacy_delete_user(user_id: str) -> Dict[str, Any]:
    """Legacy endpoint - use /user instead"""
    try:
        from firebase_admin import auth
        auth.delete_user(user_id)
        return {"success": True, "message": "User deleted from Firebase Auth"}
    except Exception as e:
        return {"success": False, "message": f"Failed to delete user: {str(e)}"}