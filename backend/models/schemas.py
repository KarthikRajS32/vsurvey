from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT = "text"
    RATING = "rating"
    YES_NO = "yes_no"

class SurveyStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

# User Models
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    created_by: str  # Client admin email

# Question Models
class QuestionOption(BaseModel):
    id: str
    text: str
    order: int = 0

class QuestionBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    type: QuestionType
    options: Optional[List[QuestionOption]] = []
    is_required: bool = True
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1, max_length=500)
    type: Optional[QuestionType] = None
    options: Optional[List[QuestionOption]] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None

class Question(QuestionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str  # Client admin email

# Survey Models
class SurveyBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: SurveyStatus = SurveyStatus.DRAFT

class SurveyCreate(SurveyBase):
    question_ids: List[str] = []

class SurveyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[SurveyStatus] = None

class Survey(SurveyBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str  # Client admin email
    question_count: int = 0

class SurveyWithQuestions(Survey):
    questions: List[Question] = []

# Survey Question Mapping
class SurveyQuestionCreate(BaseModel):
    survey_id: str
    question_id: str
    order: int = 0

class SurveyQuestion(SurveyQuestionCreate):
    id: str
    created_at: datetime

# Survey Assignment Models
class SurveyAssignmentCreate(BaseModel):
    survey_id: str
    user_ids: List[str]

class SurveyAssignmentUpdate(BaseModel):
    is_active: Optional[bool] = None

class SurveyAssignment(BaseModel):
    id: str
    survey_id: str
    user_id: str
    is_active: bool = True
    assigned_at: datetime
    assigned_by: str  # Client admin email

# Survey Response Models
class ResponseAnswer(BaseModel):
    question_id: str
    answer: Any  # Can be string, number, list, etc.

class SurveyResponseCreate(BaseModel):
    survey_id: str
    answers: List[ResponseAnswer]

class SurveyResponse(SurveyResponseCreate):
    id: str
    user_id: str
    submitted_at: datetime
    is_complete: bool = True

# Client Admin Models
class ClientAdminProfile(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    industry: str = Field(..., min_length=1, max_length=50)
    company_size: str
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientAdmin(BaseModel):
    id: str
    email: EmailStr
    profile: Optional[ClientAdminProfile] = None
    is_first_time: bool = True
    created_at: datetime
    updated_at: datetime

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
