from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import Question, QuestionCreate, QuestionUpdate, QuestionType, PaginatedResponse
from models.database import get_db, COLLECTIONS
from google.cloud.firestore_v1 import FieldFilter

class QuestionService:
    def __init__(self):
        self.db = get_db()
        # We'll set the collection path dynamically based on client
    
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
    
    async def get_client_questions_collection(self, client_email: str):
        """Get the questions collection for a specific client"""
        client_info = await self.find_client_by_email(client_email)
        
        if not client_info:
            raise ValueError(f"Failed to create/find client admin: {client_email}")
        
        # Ensure client document exists
        await self.ensure_client_exists(client_info, client_email)
        
        path = f"superadmin/{client_info['superadmin_id']}/clients/{client_info['client_id']}/questions"
        print(f"DEBUG: Using Firestore path: {path}")
        
        collection_ref = self.db.collection("superadmin").document(client_info["superadmin_id"]).collection("clients").document(client_info["client_id"]).collection("questions")
        print(f"DEBUG: Collection reference path: {collection_ref._path}")
        return collection_ref

    async def create_question(self, question_data: QuestionCreate, created_by: str) -> Question:
        """Create a new question"""
        print(f"DEBUG: Creating question for {created_by}")
        
        # Validate options for multiple choice questions
        if question_data.type == QuestionType.MULTIPLE_CHOICE:
            if not question_data.options or len(question_data.options) < 2:
                raise ValueError("Multiple choice questions must have at least 2 options")
        
        # Create new question
        question_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        question = Question(
            id=question_id,
            text=question_data.text,
            type=question_data.type,
            options=question_data.options or [],
            is_required=question_data.is_required,
            order=question_data.order,
            created_at=now,
            updated_at=now,
            created_by=created_by
        )
        
        try:
            # Save to Firestore in hierarchical structure
            print(f"DEBUG: Finding client collection for {created_by}")
            collection = await self.get_client_questions_collection(created_by)
            print(f"DEBUG: Got collection, saving question {question_id}")
            print(f"DEBUG: Collection path: {collection._path}")
            collection.document(question_id).set(question.dict())
            print(f"DEBUG: Question saved successfully at path: {collection._path}/{question_id}")
        except Exception as e:
            print(f"ERROR: Failed to save question: {e}")
            import traceback
            traceback.print_exc()
            raise e
        
        return question

    async def get_questions(
        self, 
        created_by: str, 
        page: int = 1, 
        size: int = 10,
        search: Optional[str] = None,
        question_type: Optional[QuestionType] = None
    ) -> PaginatedResponse:
        """Get paginated list of questions"""
        collection = await self.get_client_questions_collection(created_by)
        query = collection.where("created_by", "==", created_by)
        
        # Apply filters
        if question_type:
            query = query.where("type", "==", question_type.value)
        
        # Get total count
        total_docs = query.get()
        total = len(list(total_docs))
        
        # Get documents without ordering (to avoid index requirement)
        docs = query.limit(size * page).get()
        
        questions = []
        for doc in docs:
            question_data = doc.to_dict()
            question_data["id"] = doc.id
            
            # Apply search filter (client-side for simplicity)
            if search:
                search_lower = search.lower()
                if search_lower not in question_data["text"].lower():
                    continue
            
            questions.append(Question(**question_data))
        
        # Simple client-side pagination
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_questions = questions[start_idx:end_idx]
        
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[question.dict() for question in paginated_questions],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_question_by_id(self, question_id: str, created_by: str) -> Optional[Question]:
        """Get question by ID"""
        collection = await self.get_client_questions_collection(created_by)
        doc = collection.document(question_id).get()
        
        if not doc.exists:
            return None
        
        question_data = doc.to_dict()
        question_data["id"] = doc.id
        
        # Check if question belongs to the current client admin
        if question_data.get("created_by") != created_by:
            return None
        
        return Question(**question_data)

    async def update_question(self, question_id: str, question_data: QuestionUpdate, created_by: str) -> Optional[Question]:
        """Update question"""
        collection = await self.get_client_questions_collection(created_by)
        doc_ref = collection.document(question_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if question belongs to the current client admin
        if current_data.get("created_by") != created_by:
            return None
        
        # Validate options for multiple choice questions
        if question_data.type == QuestionType.MULTIPLE_CHOICE:
            if not question_data.options or len(question_data.options) < 2:
                raise ValueError("Multiple choice questions must have at least 2 options")
        
        # Update fields
        update_data = {}
        if question_data.text is not None:
            update_data["text"] = question_data.text
        if question_data.type is not None:
            update_data["type"] = question_data.type.value
        if question_data.options is not None:
            update_data["options"] = [option.dict() for option in question_data.options]
        if question_data.is_required is not None:
            update_data["is_required"] = question_data.is_required
        if question_data.order is not None:
            update_data["order"] = question_data.order
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update document
        doc_ref.update(update_data)
        
        # Return updated question
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return Question(**updated_data)

    async def delete_question(self, question_id: str, created_by: str) -> bool:
        """Delete question"""
        collection = await self.get_client_questions_collection(created_by)
        doc_ref = collection.document(question_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        question_data = doc.to_dict()
        
        # Check if question belongs to the current client admin
        if question_data.get("created_by") != created_by:
            return False
        
        # TODO: Check if question is used in any surveys before deleting
        # For now, we'll allow deletion
        
        # Delete document
        doc_ref.delete()
        
        return True

    async def get_questions_by_ids(self, question_ids: List[str], created_by: str) -> List[Question]:
        """Get multiple questions by their IDs"""
        if not question_ids:
            return []
        
        questions = []
        for question_id in question_ids:
            question = await self.get_question_by_id(question_id, created_by)
            if question:
                questions.append(question)
        
        return questions
