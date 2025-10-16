from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import User, UserCreate, UserUpdate, PaginatedResponse
from models.database import get_db, COLLECTIONS
from google.cloud.firestore_v1 import FieldFilter

class UserService:
    def __init__(self):
        self.db = get_db()
    
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
    
    async def get_client_users_collection(self, client_email: str):
        """Get the users collection for a specific client"""
        client_info = await self.find_client_by_email(client_email)
        
        if not client_info:
            print(f"DEBUG: Client admin not found, returning empty collection for: {client_email}")
            return self.db.collection("_non_existent_collection_")
        
        # Ensure client document exists
        await self.ensure_client_exists(client_info, client_email)
        
        path = f"superadmin/{client_info['superadmin_id']}/clients/{client_info['client_id']}/users"
        print(f"DEBUG: Using Firestore path: {path}")
        
        return self.db.collection("superadmin").document(client_info["superadmin_id"]).collection("clients").document(client_info["client_id"]).collection("users")

    async def create_user(self, user_data: UserCreate, created_by: str) -> User:
        """Create a new user"""
        collection = await self.get_client_users_collection(created_by)
        
        # Check if user with email already exists for this client admin
        existing_users = collection.where(
            "email", "==", user_data.email
        ).where(
            "created_by", "==", created_by
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
            is_active=False,
            status="pending",
            created_at=now,
            updated_at=now,
            created_by=created_by
        )
        
        # Save to client-specific Firestore collection
        collection.document(user_id).set(user.dict())
        
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
        collection = await self.get_client_users_collection(created_by)
        query = collection.where("created_by", "==", created_by)
        
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
        collection = await self.get_client_users_collection(created_by)
        doc = collection.document(user_id).get()
        
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
        collection = await self.get_client_users_collection(created_by)
        doc_ref = collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Check if user belongs to the current client admin
        if current_data.get("created_by") != created_by:
            return None
        
        # Check for email uniqueness if email is being updated
        if user_data.email and user_data.email != current_data["email"]:
            existing_users = collection.where(
                "email", "==", user_data.email
            ).where(
                "created_by", "==", created_by
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
        if user_data.status is not None:
            update_data["status"] = user_data.status
        
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
        collection = await self.get_client_users_collection(created_by)
        doc_ref = collection.document(user_id)
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
        collection = await self.get_client_users_collection(created_by)
        doc_ref = collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        user_data = doc.to_dict()
        
        # Check if user belongs to the current client admin
        if user_data.get("created_by") != created_by:
            return None
        
        # Determine new status based on current status
        current_status = user_data.get("status", "pending")
        current_is_active = user_data.get("is_active", False)
        
        if current_status == "pending":
            # Pending -> Active
            new_status = "active"
            new_is_active = True
        elif current_status == "active":
            # Active -> Inactive
            new_status = "inactive"
            new_is_active = False
        elif current_status == "inactive":
            # Inactive -> Active
            new_status = "active"
            new_is_active = True
        else:
            # Default toggle
            new_is_active = not current_is_active
            new_status = "active" if new_is_active else "inactive"
        
        doc_ref.update({
            "is_active": new_is_active,
            "status": new_status,
            "updated_at": datetime.utcnow()
        })
        
        # Return updated user
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["id"] = updated_doc.id
        
        return User(**updated_data)
    
    async def activate_user_on_first_login(self, user_email: str) -> Optional[User]:
        """Activate user on first mobile login - works with flat users collection"""
        try:
            # Query the flat users collection by email
            users_collection = self.db.collection("users")
            query = users_collection.where("email", "==", user_email).limit(1)
            docs = query.get()
            
            if not docs:
                print(f"User not found in flat collection: {user_email}")
                return None
            
            user_doc = docs[0]
            user_data = user_doc.to_dict()
            
            # Only activate if currently pending
            if user_data.get("status") == "pending":
                print(f"Activating user: {user_email}")
                user_doc.reference.update({
                    "status": "active",
                    "is_active": True,
                    "activatedAt": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                })
                
                # Get updated data
                updated_doc = user_doc.reference.get()
                updated_data = updated_doc.to_dict()
                updated_data["id"] = updated_doc.id
                
                return User(**updated_data)
            else:
                print(f"User already active or not pending: {user_email}, status: {user_data.get('status')}")
                user_data["id"] = user_doc.id
                return User(**user_data)
                
        except Exception as e:
            print(f"Error activating user on first login: {e}")
            return None
