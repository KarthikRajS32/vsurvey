from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from models.schemas import (
    Question, QuestionCreate, QuestionUpdate, APIResponse, PaginatedResponse, QuestionType
)
from middleware.auth import get_current_user_email
from services.question_service import QuestionService

router = APIRouter()

@router.post("/", response_model=APIResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Create a new question"""
    try:
        question_service = QuestionService()
        question = await question_service.create_question(question_data, current_user_email)
        
        return APIResponse(
            success=True,
            message="Question created successfully",
            data=question.dict()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=PaginatedResponse)
async def get_questions(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    question_type: Optional[QuestionType] = Query(None),
    current_user_email: str = Depends(get_current_user_email)
):
    """Get paginated list of questions"""
    try:
        question_service = QuestionService()
        result = await question_service.get_questions(
            current_user_email, page, size, search, question_type
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{question_id}", response_model=APIResponse)
async def get_question(
    question_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Get a specific question by ID"""
    try:
        question_service = QuestionService()
        question = await question_service.get_question_by_id(question_id, current_user_email)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return APIResponse(
            success=True,
            message="Question retrieved successfully",
            data=question.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{question_id}", response_model=APIResponse)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Update a question"""
    try:
        question_service = QuestionService()
        question = await question_service.update_question(question_id, question_data, current_user_email)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return APIResponse(
            success=True,
            message="Question updated successfully",
            data=question.dict()
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{question_id}", response_model=APIResponse)
async def delete_question(
    question_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Delete a question"""
    try:
        question_service = QuestionService()
        success = await question_service.delete_question(question_id, current_user_email)
        
        if not success:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return APIResponse(
            success=True,
            message="Question deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/types/", response_model=APIResponse)
async def get_question_types():
    """Get available question types"""
    return APIResponse(
        success=True,
        message="Question types retrieved successfully",
        data=[
            {"value": "multiple_choice", "label": "Multiple Choice"},
            {"value": "text", "label": "Text"},
            {"value": "rating", "label": "Rating"},
            {"value": "yes_no", "label": "Yes/No"}
        ]
    )
