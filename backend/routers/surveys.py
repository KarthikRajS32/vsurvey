from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from models.schemas import (
    Survey, SurveyCreate, SurveyUpdate, SurveyWithQuestions, 
    APIResponse, PaginatedResponse, SurveyStatus
)
from middleware.auth import get_current_user_email
from services.survey_service import SurveyService

router = APIRouter()

@router.post("/", response_model=APIResponse)
async def create_survey(
    survey_data: SurveyCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Create a new survey"""
    try:
        survey_service = SurveyService()
        survey = await survey_service.create_survey(survey_data, current_user_email)
        
        return APIResponse(
            success=True,
            message="Survey created successfully",
            data=survey.dict()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=PaginatedResponse)
async def get_surveys(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[SurveyStatus] = Query(None),
    current_user_email: str = Depends(get_current_user_email)
):
    """Get paginated list of surveys"""
    try:
        survey_service = SurveyService()
        result = await survey_service.get_surveys(
            current_user_email, page, size, search, status
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{survey_id}", response_model=APIResponse)
async def get_survey(
    survey_id: str,
    include_questions: bool = Query(False),
    current_user_email: str = Depends(get_current_user_email)
):
    """Get a specific survey by ID"""
    try:
        survey_service = SurveyService()
        
        if include_questions:
            survey = await survey_service.get_survey_with_questions(survey_id, current_user_email)
        else:
            survey = await survey_service.get_survey_by_id(survey_id, current_user_email)
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return APIResponse(
            success=True,
            message="Survey retrieved successfully",
            data=survey.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{survey_id}", response_model=APIResponse)
async def update_survey(
    survey_id: str,
    survey_data: SurveyUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Update a survey"""
    try:
        survey_service = SurveyService()
        survey = await survey_service.update_survey(survey_id, survey_data, current_user_email)
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return APIResponse(
            success=True,
            message="Survey updated successfully",
            data=survey.dict()
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{survey_id}", response_model=APIResponse)
async def delete_survey(
    survey_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Delete a survey"""
    try:
        survey_service = SurveyService()
        success = await survey_service.delete_survey(survey_id, current_user_email)
        
        if not success:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return APIResponse(
            success=True,
            message="Survey deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{survey_id}/questions/{question_id}", response_model=APIResponse)
async def add_question_to_survey(
    survey_id: str,
    question_id: str,
    order: int = Query(0),
    current_user_email: str = Depends(get_current_user_email)
):
    """Add a question to a survey"""
    try:
        survey_service = SurveyService()
        success = await survey_service.add_question_to_survey(
            survey_id, question_id, order, current_user_email
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add question to survey")
        
        return APIResponse(
            success=True,
            message="Question added to survey successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{survey_id}/questions/{question_id}", response_model=APIResponse)
async def remove_question_from_survey(
    survey_id: str,
    question_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Remove a question from a survey"""
    try:
        survey_service = SurveyService()
        success = await survey_service.remove_question_from_survey(
            survey_id, question_id, current_user_email
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Question not found in survey")
        
        return APIResponse(
            success=True,
            message="Question removed from survey successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{survey_id}/status", response_model=APIResponse)
async def update_survey_status(
    survey_id: str,
    status: SurveyStatus,
    current_user_email: str = Depends(get_current_user_email)
):
    """Update survey status"""
    try:
        survey_service = SurveyService()
        survey = await survey_service.update_survey_status(survey_id, status, current_user_email)
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return APIResponse(
            success=True,
            message=f"Survey status updated to {status.value}",
            data=survey.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
