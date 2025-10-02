from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from models.schemas import (
    SurveyAssignment, SurveyAssignmentCreate, SurveyAssignmentUpdate,
    APIResponse, PaginatedResponse
)
from middleware.auth import get_current_user_email
from services.assignment_service import AssignmentService

router = APIRouter()

@router.post("/", response_model=APIResponse)
async def assign_survey_to_users(
    assignment_data: SurveyAssignmentCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Assign a survey to multiple users"""
    try:
        assignment_service = AssignmentService()
        assignments = await assignment_service.assign_survey_to_users(
            assignment_data, current_user_email
        )
        
        return APIResponse(
            success=True,
            message=f"Survey assigned to {len(assignments)} users successfully",
            data=[assignment.dict() for assignment in assignments]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=PaginatedResponse)
async def get_assignments(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    survey_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user_email: str = Depends(get_current_user_email)
):
    """Get paginated list of survey assignments"""
    try:
        assignment_service = AssignmentService()
        result = await assignment_service.get_assignments(
            current_user_email, page, size, survey_id, user_id, is_active
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/survey/{survey_id}", response_model=APIResponse)
async def get_survey_assignments(
    survey_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Get all assignments for a specific survey"""
    try:
        assignment_service = AssignmentService()
        assignments = await assignment_service.get_survey_assignments(
            survey_id, current_user_email
        )
        
        return APIResponse(
            success=True,
            message="Survey assignments retrieved successfully",
            data=[assignment.dict() for assignment in assignments]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{user_id}", response_model=APIResponse)
async def get_user_assignments(
    user_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Get all assignments for a specific user"""
    try:
        assignment_service = AssignmentService()
        assignments = await assignment_service.get_user_assignments(
            user_id, current_user_email
        )
        
        return APIResponse(
            success=True,
            message="User assignments retrieved successfully",
            data=[assignment.dict() for assignment in assignments]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{assignment_id}", response_model=APIResponse)
async def update_assignment(
    assignment_id: str,
    assignment_data: SurveyAssignmentUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Update a survey assignment"""
    try:
        assignment_service = AssignmentService()
        assignment = await assignment_service.update_assignment(
            assignment_id, assignment_data, current_user_email
        )
        
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        return APIResponse(
            success=True,
            message="Assignment updated successfully",
            data=assignment.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{assignment_id}", response_model=APIResponse)
async def delete_assignment(
    assignment_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Delete a survey assignment"""
    try:
        assignment_service = AssignmentService()
        success = await assignment_service.delete_assignment(
            assignment_id, current_user_email
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        return APIResponse(
            success=True,
            message="Assignment deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/survey/{survey_id}/user/{user_id}", response_model=APIResponse)
async def remove_user_from_survey(
    survey_id: str,
    user_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Remove a user from a survey"""
    try:
        assignment_service = AssignmentService()
        success = await assignment_service.remove_user_from_survey(
            survey_id, user_id, current_user_email
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        return APIResponse(
            success=True,
            message="User removed from survey successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
