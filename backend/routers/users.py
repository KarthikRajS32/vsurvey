from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from datetime import datetime

from models.schemas import (
    User, UserCreate, UserUpdate, APIResponse, PaginatedResponse
)
from models.database import get_db, COLLECTIONS
from middleware.auth import get_current_user_email
from services.user_service import UserService

router = APIRouter()

@router.post("/", response_model=APIResponse)
async def create_user(
    user_data: UserCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Create a new user"""
    try:
        user_service = UserService()
        user = await user_service.create_user(user_data, current_user_email)
        
        return APIResponse(
            success=True,
            message="User created successfully",
            data=user.dict()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=PaginatedResponse)
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user_email: str = Depends(get_current_user_email)
):
    """Get paginated list of users"""
    try:
        print(f"DEBUG: Getting users for {current_user_email}")
        user_service = UserService()
        print(f"DEBUG: UserService created")
        result = await user_service.get_users(
            current_user_email, page, size, search, is_active
        )
        print(f"DEBUG: Got result: {result}")
        
        return result
    except Exception as e:
        print(f"ERROR in get_users: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{user_id}", response_model=APIResponse)
async def get_user(
    user_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Get a specific user by ID"""
    try:
        user_service = UserService()
        user = await user_service.get_user_by_id(user_id, current_user_email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(
            success=True,
            message="User retrieved successfully",
            data=user.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Update a user"""
    try:
        user_service = UserService()
        user = await user_service.update_user(user_id, user_data, current_user_email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(
            success=True,
            message="User updated successfully",
            data=user.dict()
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Delete a user"""
    try:
        user_service = UserService()
        success = await user_service.delete_user(user_id, current_user_email)
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(
            success=True,
            message="User deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{user_id}/toggle-status", response_model=APIResponse)
async def toggle_user_status(
    user_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Toggle user active status"""
    try:
        user_service = UserService()
        user = await user_service.toggle_user_status(user_id, current_user_email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(
            success=True,
            message=f"User {'activated' if user.is_active else 'deactivated'} successfully",
            data=user.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/activate-on-login", response_model=APIResponse)
async def activate_user_on_login(
    current_user_email: str = Depends(get_current_user_email)
):
    """Activate user on first mobile login"""
    try:
        user_service = UserService()
        user = await user_service.activate_user_on_first_login(current_user_email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(
            success=True,
            message="User activated successfully" if user.status == "active" else "User already active",
            data=user.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
