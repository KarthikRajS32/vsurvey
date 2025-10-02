from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import User, UserCreate, UserUpdate, PaginatedResponse
from models.database import get_db, COLLECTIONS
from google.cloud.firestore_v1 import FieldFilter

class UserService:
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.collection(COLLECTIONS["users"])

    async def create_user(self, user_data: UserCreate, created_by: str) -> User:
        """Create a new user"""
        # Check if user with email already exists for this client admin
        existing_users = self.collection.where(
            filter=FieldFilter("email", "==", user_data.email)
        ).where(
            filter=FieldFilter("created_by", "==", created_by)
        ).limit(1).get()
        
        if len(list(existing_users)) > 0:
            raise ValueError("User with this email already exists")
        
        # Create new user
        user_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        user = User(
            id=user_id,
            full_name=user_data.full_name,
            email=user_data.email,
            is_active=True,
            created_at=now,
            updated_at=now,
            created_by=created_by
        )
        
        # Save to Firestore
        self.collection.document(user_id).set(user.dict())
        
        return user

    async def get_users(
        self, 
        created_by: str, 
        page: int = 1, 
        size: int = 10,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> PaginatedResponse:
        """Get paginated list of users"""
        query = self.collection.where("created_by", "==", created_by)
        
        # Apply filters
        if is_active is not None:
            query = query.where("is_active", "==", is_active)
        
        # Get total count
        total_docs = query.get()
        total = len(list(total_docs))
        
        # Get documents without ordering (to avoid index requirement)
        docs = query.limit(size * page).get()
        
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            user_data["id"] = doc.id
            
            # Apply search filter (client-side for simplicity)
            if search:
                search_lower = search.lower()
                if (search_lower not in user_data["full_name"].lower() and 
                    search_lower not in user_data["email"].lower()):
                    continue
            
            users.append(User(**user_data))
        
        # Simple client-side pagination
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_users = users[start_idx:end_idx]
        
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[user.dict() for user in paginated_users],
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_user_by_id(self, user_id: str, created_by: str) -> Optional[User]:
        """Get user by ID"""
        doc = self.collection.document(user_id).get()
        
        if not doc.exists:
            return None
        
        user_data = doc.to_dict()
        user_data["id"] = doc.id
        
        # Check if user belongs to the current client admin
        if user_data.get("created_by") != created_by:
            return None
        
        return User(**user_data)

    async def update_user(self, user_id: str, user_data: UserUpdate, created_by: str) -> Optional[User]:
        """Update user"""
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if user belongs to the current client admin
        if current_data.get("created_by") != created_by:
            return None
        
        # Check for email uniqueness if email is being updated
        if user_data.email and user_data.email != current_data["email"]:
            existing_users = self.collection.where(
                filter=FieldFilter("email", "==", user_data.email)
            ).where(
                filter=FieldFilter("created_by", "==", created_by)
            ).limit(1).get()
            
            if len(list(existing_users)) > 0:
                raise ValueError("User with this email already exists")
        
        # Update fields
        update_data = {}
        if user_data.full_name is not None:
            update_data["full_name"] = user_data.full_name
        if user_data.email is not None:
            update_data["email"] = user_data.email
        if user_data.is_active is not None:
            update_data["is_active"] = user_data.is_active
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update document
        doc_ref.update(update_data)
        
        # Return updated user
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return User(**updated_data)

    async def delete_user(self, user_id: str, created_by: str) -> bool:
        """Delete user"""
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        user_data = doc.to_dict()
        
        # Check if user belongs to the current client admin
        if user_data.get("created_by") != created_by:
            return False
        
        # Delete document
        doc_ref.delete()
        
        return True

    async def toggle_user_status(self, user_id: str, created_by: str) -> Optional[User]:
        """Toggle user active status"""
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        user_data = doc.to_dict()
        
        # Check if user belongs to the current client admin
        if user_data.get("created_by") != created_by:
            return None
        
        # Toggle status
        new_status = not user_data.get("is_active", True)
        doc_ref.update({
            "is_active": new_status,
            "updated_at": datetime.utcnow()
        })
        
        # Return updated user
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return User(**updated_data)
