from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import (
    SurveyAssignment, SurveyAssignmentCreate, SurveyAssignmentUpdate, PaginatedResponse
)
from models.database import get_db, COLLECTIONS
from services.survey_service import SurveyService
from services.user_service import UserService
# FieldFilter not available in older firestore version

class AssignmentService:
    def __init__(self):
        self.db = get_db()
        self.survey_service = SurveyService()
        self.user_service = UserService()
    
    async def find_client_by_email(self, client_email: str):
        """Find client document ID by email"""
        try:
            print(f"DEBUG: Searching for client with email: {client_email}")
            # Search through all superadmin documents
            superadmin_collection = self.db.collection("superadmin")
            superadmin_docs = superadmin_collection.stream()
            
            for superadmin_doc in superadmin_docs:
                print(f"DEBUG: Checking superadmin: {superadmin_doc.id}")
                # Search through clients in this superadmin
                clients_collection = superadmin_doc.reference.collection("clients")
                clients_docs = clients_collection.where("email", "==", client_email).stream()
                
                for client_doc in clients_docs:
                    print(f"DEBUG: Found client {client_doc.id} in superadmin {superadmin_doc.id}")
                    return {
                        "superadmin_id": superadmin_doc.id,
                        "client_id": client_doc.id
                    }
            
            print(f"DEBUG: Client not found")
            return None
        except Exception as e:
            print(f"ERROR finding client: {e}")
            return None
    
    async def ensure_client_exists(self, client_info: dict, client_email: str):
        """Ensure client document exists in Firestore"""
        try:
            client_doc_ref = self.db.collection("superadmin").document(client_info["superadmin_id"]).collection("clients").document(client_info["client_id"])
            client_doc = client_doc_ref.get()
            
            if not client_doc.exists:
                # Create client document if it doesn't exist
                client_data = {
                    "email": client_email,
                    "created_at": datetime.utcnow(),
                    "status": "active"
                }
                client_doc_ref.set(client_data)
                print(f"DEBUG: Created client document for {client_email} with ID {client_info['client_id']}")
        except Exception as e:
            print(f"ERROR ensuring client exists: {e}")
    
    async def get_client_assignments_collection(self, client_email: str):
        """Get the survey_assignments collection for a specific client"""
        client_info = await self.find_client_by_email(client_email)
        
        if not client_info:
            raise ValueError(f"Failed to create/find client admin: {client_email}")
        
        # Ensure client document exists
        await self.ensure_client_exists(client_info, client_email)
        
        path = f"superadmin/{client_info['superadmin_id']}/clients/{client_info['client_id']}/survey_assignments"
        print(f"DEBUG: Using Firestore path: {path}")
        
        return self.db.collection("superadmin").document(client_info["superadmin_id"]).collection("clients").document(client_info["client_id"]).collection("survey_assignments")

    async def assign_survey_to_users(self, assignment_data: SurveyAssignmentCreate, assigned_by: str) -> List[SurveyAssignment]:
        """Assign a survey to multiple users"""
        # Verify survey exists and belongs to user
        survey = await self.survey_service.get_survey_by_id(assignment_data.survey_id, assigned_by)
        if not survey:
            raise ValueError("Survey not found")
        
        collection = await self.get_client_assignments_collection(assigned_by)
        
        # Get all existing assignments for this survey to check for duplicates
        existing_assignments = collection.where(
            "survey_id", "==", assignment_data.survey_id
        ).where(
            "assigned_by", "==", assigned_by
        ).get()
        
        existing_user_ids = set()
        for doc in existing_assignments:
            data = doc.to_dict()
            existing_user_ids.add(data.get("user_id"))
        
        # Verify all users exist and belong to the client admin
        assignments = []
        for user_id in assignment_data.user_ids:
            user = await self.user_service.get_user_by_id(user_id, assigned_by)
            if not user:
                continue  # Skip invalid users
            
            # Check if assignment already exists for this user-survey combination
            if user_id in existing_user_ids:
                print(f"DEBUG: Skipping duplicate assignment - Survey {assignment_data.survey_id} already assigned to user {user_id}")
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
            
            # Save to client-specific Firestore collection
            collection.document(assignment_id).set(assignment.dict())
            assignments.append(assignment)
            
            # Add to existing_user_ids to prevent duplicates within this batch
            existing_user_ids.add(user_id)
        
        if len(assignments) == 0 and len(assignment_data.user_ids) > 0:
            raise ValueError("Survey is already assigned to all selected users")
        
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
        collection = await self.get_client_assignments_collection(assigned_by)
        query = collection.where("assigned_by", "==", assigned_by)
        
        # Apply filters
        if survey_id:
            query = query.where("survey_id", "==", survey_id)
        if user_id:
            query = query.where("user_id", "==", user_id)
        if is_active is not None:
            query = query.where("is_active", "==", is_active)
        
        # Get total count
        total_docs = query.get()
        total = len(list(total_docs))
        
        # Get documents without ordering (to avoid index requirement)
        docs = query.limit(size * page).get()
        
        assignments = []
        for doc in docs:
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id
            assignments.append(SurveyAssignment(**assignment_data))
        
        # Simple client-side pagination
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_assignments = assignments[start_idx:end_idx]
        
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[assignment.dict() for assignment in paginated_assignments],
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
        
        collection = await self.get_client_assignments_collection(assigned_by)
        docs = collection.where(
            "survey_id", "==", survey_id
        ).where(
            "assigned_by", "==", assigned_by
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
        
        collection = await self.get_client_assignments_collection(assigned_by)
        docs = collection.where(
            "user_id", "==", user_id
        ).where(
            "assigned_by", "==", assigned_by
        ).get()
        
        assignments = []
        for doc in docs:
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id
            assignments.append(SurveyAssignment(**assignment_data))
        
        return assignments

    async def update_assignment(self, assignment_id: str, assignment_data: SurveyAssignmentUpdate, assigned_by: str) -> Optional[SurveyAssignment]:
        """Update an assignment"""
        collection = await self.get_client_assignments_collection(assigned_by)
        doc_ref = collection.document(assignment_id)
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
        collection = await self.get_client_assignments_collection(assigned_by)
        doc_ref = collection.document(assignment_id)
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
        collection = await self.get_client_assignments_collection(assigned_by)
        docs = collection.where(
            "survey_id", "==", survey_id
        ).where(
            "user_id", "==", user_id
        ).where(
            "assigned_by", "==", assigned_by
        ).limit(1).get()
        
        docs_list = list(docs)
        if len(docs_list) == 0:
            return False
        
        # Delete the assignment
        docs_list[0].reference.delete()
        
        return True
