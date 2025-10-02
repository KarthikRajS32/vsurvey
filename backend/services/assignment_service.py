from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import (
    SurveyAssignment, SurveyAssignmentCreate, SurveyAssignmentUpdate, PaginatedResponse
)
from models.database import get_db, COLLECTIONS
from services.survey_service import SurveyService
from services.user_service import UserService
from google.cloud.firestore_v1 import FieldFilter

class AssignmentService:
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.collection(COLLECTIONS["survey_assignments"])
        self.survey_service = SurveyService()
        self.user_service = UserService()

    async def assign_survey_to_users(self, assignment_data: SurveyAssignmentCreate, assigned_by: str) -> List[SurveyAssignment]:
        """Assign a survey to multiple users"""
        # Verify survey exists and belongs to user
        survey = await self.survey_service.get_survey_by_id(assignment_data.survey_id, assigned_by)
        if not survey:
            raise ValueError("Survey not found")
        
        # Verify all users exist and belong to the client admin
        assignments = []
        for user_id in assignment_data.user_ids:
            user = await self.user_service.get_user_by_id(user_id, assigned_by)
            if not user:
                continue  # Skip invalid users
            
            # Check if assignment already exists
            existing_docs = self.collection.where(
                filter=FieldFilter("survey_id", "==", assignment_data.survey_id)
            ).where(
                filter=FieldFilter("user_id", "==", user_id)
            ).limit(1).get()
            
            if len(list(existing_docs)) > 0:
                continue  # Skip if already assigned
            
            # Create assignment
            assignment_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            assignment = SurveyAssignment(
                id=assignment_id,
                survey_id=assignment_data.survey_id,
                user_id=user_id,
                is_active=True,
                assigned_at=now,
                assigned_by=assigned_by
            )
            
            # Save to Firestore
            self.collection.document(assignment_id).set(assignment.dict())
            assignments.append(assignment)
        
        return assignments

    async def get_assignments(
        self, 
        assigned_by: str, 
        page: int = 1, 
        size: int = 10,
        survey_id: Optional[str] = None,
        user_id: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> PaginatedResponse:
        """Get paginated list of assignments"""
        query = self.collection.where(filter=FieldFilter("assigned_by", "==", assigned_by))
        
        # Apply filters
        if survey_id:
            query = query.where(filter=FieldFilter("survey_id", "==", survey_id))
        if user_id:
            query = query.where(filter=FieldFilter("user_id", "==", user_id))
        if is_active is not None:
            query = query.where(filter=FieldFilter("is_active", "==", is_active))
        
        # Get total count
        total_docs = query.get()
        total = len(list(total_docs))
        
        # Apply pagination
        offset = (page - 1) * size
        docs = query.order_by("assigned_at", direction="DESCENDING").offset(offset).limit(size).get()
        
        assignments = []
        for doc in docs:
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id
            assignments.append(SurveyAssignment(**assignment_data))
        
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[assignment.dict() for assignment in assignments],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_survey_assignments(self, survey_id: str, assigned_by: str) -> List[SurveyAssignment]:
        """Get all assignments for a specific survey"""
        # Verify survey exists and belongs to user
        survey = await self.survey_service.get_survey_by_id(survey_id, assigned_by)
        if not survey:
            return []
        
        docs = self.collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).where(
            filter=FieldFilter("assigned_by", "==", assigned_by)
        ).get()
        
        assignments = []
        for doc in docs:
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id
            assignments.append(SurveyAssignment(**assignment_data))
        
        return assignments

    async def get_user_assignments(self, user_id: str, assigned_by: str) -> List[SurveyAssignment]:
        """Get all assignments for a specific user"""
        # Verify user exists and belongs to the client admin
        user = await self.user_service.get_user_by_id(user_id, assigned_by)
        if not user:
            return []
        
        docs = self.collection.where(
            filter=FieldFilter("user_id", "==", user_id)
        ).where(
            filter=FieldFilter("assigned_by", "==", assigned_by)
        ).get()
        
        assignments = []
        for doc in docs:
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id
            assignments.append(SurveyAssignment(**assignment_data))
        
        return assignments

    async def update_assignment(self, assignment_id: str, assignment_data: SurveyAssignmentUpdate, assigned_by: str) -> Optional[SurveyAssignment]:
        """Update an assignment"""
        doc_ref = self.collection.document(assignment_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if assignment belongs to the current client admin
        if current_data.get("assigned_by") != assigned_by:
            return None
        
        # Update fields
        update_data = {}
        if assignment_data.is_active is not None:
            update_data["is_active"] = assignment_data.is_active
        
        if not update_data:
            return None  # No updates to make
        
        # Update document
        doc_ref.update(update_data)
        
        # Return updated assignment
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return SurveyAssignment(**updated_data)

    async def delete_assignment(self, assignment_id: str, assigned_by: str) -> bool:
        """Delete an assignment"""
        doc_ref = self.collection.document(assignment_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        assignment_data = doc.to_dict()
        
        # Check if assignment belongs to the current client admin
        if assignment_data.get("assigned_by") != assigned_by:
            return False
        
        # Delete document
        doc_ref.delete()
        
        return True

    async def remove_user_from_survey(self, survey_id: str, user_id: str, assigned_by: str) -> bool:
        """Remove a user from a survey"""
        # Find the assignment
        docs = self.collection.where(
            filter=FieldFilter("survey_id", "==", survey_id)
        ).where(
            filter=FieldFilter("user_id", "==", user_id)
        ).where(
            filter=FieldFilter("assigned_by", "==", assigned_by)
        ).limit(1).get()
        
        docs_list = list(docs)
        if len(docs_list) == 0:
            return False
        
        # Delete the assignment
        docs_list[0].reference.delete()
        
        return True
