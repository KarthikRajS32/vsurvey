from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import (
    Survey, SurveyCreate, SurveyUpdate, SurveyWithQuestions, 
    SurveyStatus, PaginatedResponse, SurveyQuestionCreate
)
from models.database import get_db, COLLECTIONS
from services.question_service import QuestionService
from google.cloud.firestore_v1 import FieldFilter

class SurveyService:
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.collection(COLLECTIONS["surveys"])
        self.survey_questions_collection = self.db.collection(COLLECTIONS["survey_questions"])
        self.question_service = QuestionService()

    async def create_survey(self, survey_data: SurveyCreate, created_by: str) -> Survey:
        """Create a new survey"""
        # Create new survey
        survey_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        survey = Survey(
            id=survey_id,
            title=survey_data.title,
            description=survey_data.description,
            status=survey_data.status,
            created_at=now,
            updated_at=now,
            created_by=created_by,
            question_count=0
        )
        
        # Save to Firestore
        self.collection.document(survey_id).set(survey.dict())
        
        # Add questions to survey if provided
        if survey_data.question_ids:
            for i, question_id in enumerate(survey_data.question_ids):
                await self.add_question_to_survey(survey_id, question_id, i, created_by)
            
            # Update question count
            survey.question_count = len(survey_data.question_ids)
            self.collection.document(survey_id).update({"question_count": survey.question_count})
        
        return survey

    async def get_surveys(
        self, 
        created_by: str, 
        page: int = 1, 
        size: int = 10,
        search: Optional[str] = None,
        status: Optional[SurveyStatus] = None
    ) -> PaginatedResponse:
        """Get paginated list of surveys"""
        query = self.collection.where(filter=FieldFilter("created_by", "==", created_by))
        
        # Apply filters
        if status:
            query = query.where(filter=FieldFilter("status", "==", status.value))
        
        # Get total count
        total_docs = query.get()
        total = len(list(total_docs))
        
        # Apply pagination
        offset = (page - 1) * size
        docs = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(size).get()
        
        surveys = []
        for doc in docs:
            survey_data = doc.to_dict()
            survey_data["id"] = doc.id
            
            # Apply search filter (client-side for simplicity)
            if search:
                search_lower = search.lower()
                if (search_lower not in survey_data["title"].lower() and 
                    search_lower not in (survey_data.get("description", "") or "").lower()):
                    continue
            
            surveys.append(Survey(**survey_data))
        
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[survey.dict() for survey in surveys],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_survey_by_id(self, survey_id: str, created_by: str) -> Optional[Survey]:
        """Get survey by ID"""
        doc = self.collection.document(survey_id).get()
        
        if not doc.exists:
            return None
        
        survey_data = doc.to_dict()
        survey_data["id"] = doc.id
        
        # Check if survey belongs to the current client admin
        if survey_data.get("created_by") != created_by:
            return None
        
        return Survey(**survey_data)

    async def get_survey_with_questions(self, survey_id: str, created_by: str) -> Optional[SurveyWithQuestions]:
        """Get survey with its questions"""
        survey = await self.get_survey_by_id(survey_id, created_by)
        if not survey:
            return None
        
        # Get survey questions
        survey_questions_docs = self.survey_questions_collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).order_by("order").get()
        
        question_ids = [doc.to_dict()["question_id"] for doc in survey_questions_docs]
        questions = await self.question_service.get_questions_by_ids(question_ids, created_by)
        
        return SurveyWithQuestions(
            **survey.dict(),
            questions=questions
        )

    async def update_survey(self, survey_id: str, survey_data: SurveyUpdate, created_by: str) -> Optional[Survey]:
        """Update survey"""
        doc_ref = self.collection.document(survey_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if survey belongs to the current client admin
        if current_data.get("created_by") != created_by:
            return None
        
        # Update fields
        update_data = {}
        if survey_data.title is not None:
            update_data["title"] = survey_data.title
        if survey_data.description is not None:
            update_data["description"] = survey_data.description
        if survey_data.status is not None:
            update_data["status"] = survey_data.status.value
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update document
        doc_ref.update(update_data)
        
        # Return updated survey
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return Survey(**updated_data)

    async def delete_survey(self, survey_id: str, created_by: str) -> bool:
        """Delete survey"""
        doc_ref = self.collection.document(survey_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        survey_data = doc.to_dict()
        
        # Check if survey belongs to the current client admin
        if survey_data.get("created_by") != created_by:
            return False
        
        # Delete survey questions mappings
        survey_questions_docs = self.survey_questions_collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).get()
        
        for doc in survey_questions_docs:
            doc.reference.delete()
        
        # Delete survey
        doc_ref.delete()
        
        return True

    async def add_question_to_survey(self, survey_id: str, question_id: str, order: int, created_by: str) -> bool:
        """Add a question to a survey"""
        # Verify survey exists and belongs to user
        survey = await self.get_survey_by_id(survey_id, created_by)
        if not survey:
            return False
        
        # Verify question exists and belongs to user
        question = await self.question_service.get_question_by_id(question_id, created_by)
        if not question:
            return False
        
        # Check if question is already in survey
        existing_docs = self.survey_questions_collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).where(
            filter=FieldFilter("question_id", "==", question_id)
        ).limit(1).get()
        
        if len(list(existing_docs)) > 0:
            return False  # Question already in survey
        
        # Add question to survey
        survey_question_id = str(uuid.uuid4())
        survey_question_data = {
            "id": survey_question_id,
            "survey_id": survey_id,
            "question_id": question_id,
            "order": order,
            "created_at": datetime.utcnow()
        }
        
        self.survey_questions_collection.document(survey_question_id).set(survey_question_data)
        
        # Update question count
        current_count = survey.question_count
        self.collection.document(survey_id).update({"question_count": current_count + 1})
        
        return True

    async def remove_question_from_survey(self, survey_id: str, question_id: str, created_by: str) -> bool:
        """Remove a question from a survey"""
        # Verify survey exists and belongs to user
        survey = await self.get_survey_by_id(survey_id, created_by)
        if not survey:
            return False
        
        # Find and delete the survey question mapping
        survey_questions_docs = self.survey_questions_collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).where(
            filter=FieldFilter("question_id", "==", question_id)
        ).limit(1).get()
        
        docs_list = list(survey_questions_docs)
        if len(docs_list) == 0:
            return False
        
        # Delete the mapping
        docs_list[0].reference.delete()
        
        # Update question count
        current_count = survey.question_count
        self.collection.document(survey_id).update({"question_count": max(0, current_count - 1)})
        
        return True

    async def update_survey_status(self, survey_id: str, status: SurveyStatus, created_by: str) -> Optional[Survey]:
        """Update survey status"""
        doc_ref = self.collection.document(survey_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if survey belongs to the current client admin
        if current_data.get("created_by") != created_by:
            return None
        
        # Update status
        doc_ref.update({
            "status": status.value,
            "updated_at": datetime.utcnow()
        })
        
        # Return updated survey
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return Survey(**updated_data)
