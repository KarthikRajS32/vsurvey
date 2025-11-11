"""Firebase Admin SDK service for secure deletion operations"""
import firebase_admin
from firebase_admin import auth, firestore
from typing import Dict, List, Any
import logging
from models.database import get_db, get_firebase_auth

logger = logging.getLogger(__name__)

class FirebaseAdminService:
    def __init__(self):
        self._db = None
    
    @property
    def db(self):
        if self._db is None:
            self._db = get_db()
        return self._db
    
    async def delete_client_completely(self, client_uid: str, client_email: str) -> Dict[str, Any]:
        """
        Delete client from Firebase Auth and all related Firestore documents
        """
        result = {
            "auth_deleted": False,
            "firestore_deleted": False,
            "subcollections_deleted": {},
            "errors": []
        }
        
        try:
            # 1. Delete from Firebase Auth
            try:
                get_firebase_auth().delete_user(client_uid)
                result["auth_deleted"] = True
                logger.info(f"Deleted client {client_email} from Firebase Auth")
            except auth.UserNotFoundError:
                result["errors"].append("User not found in Firebase Auth")
            except Exception as e:
                result["errors"].append(f"Auth deletion failed: {str(e)}")
            
            # 2. Delete all subcollections for this client
            superadmin_id = "u1JiUOCTXxaOkoK83AFH"
            client_doc_ref = self.db.collection("superadmin").document(superadmin_id).collection("clients").document(client_uid)
            
            # Delete subcollections
            subcollections = ["surveys", "questions", "survey_assignments"]
            for subcol in subcollections:
                try:
                    subcol_ref = client_doc_ref.collection(subcol)
                    docs = subcol_ref.stream()
                    deleted_count = 0
                    for doc in docs:
                        doc.reference.delete()
                        deleted_count += 1
                    result["subcollections_deleted"][subcol] = deleted_count
                    logger.info(f"Deleted {deleted_count} documents from {subcol}")
                except Exception as e:
                    result["errors"].append(f"Failed to delete {subcol}: {str(e)}")
            
            # 3. Delete all users created by this client
            try:
                users_ref = self.db.collection("users")
                user_docs = users_ref.where("created_by", "==", client_email).stream()
                deleted_users = 0
                for user_doc in user_docs:
                    user_data = user_doc.to_dict()
                    # Delete user from Firebase Auth if they have firebaseUid
                    if "firebaseUid" in user_data:
                        try:
                            get_firebase_auth().delete_user(user_data["firebaseUid"])
                        except:
                            pass  # Continue even if auth deletion fails
                    # Delete user document
                    user_doc.reference.delete()
                    deleted_users += 1
                result["subcollections_deleted"]["users"] = deleted_users
                logger.info(f"Deleted {deleted_users} users created by client")
            except Exception as e:
                result["errors"].append(f"Failed to delete users: {str(e)}")
            
            # 4. Delete client document
            try:
                client_doc_ref.delete()
                result["firestore_deleted"] = True
                logger.info(f"Deleted client document for {client_email}")
            except Exception as e:
                result["errors"].append(f"Failed to delete client document: {str(e)}")
            
            return result
            
        except Exception as e:
            result["errors"].append(f"Unexpected error: {str(e)}")
            return result
    
    async def delete_user_completely(self, user_uid: str, user_email: str, client_email: str) -> Dict[str, Any]:
        """
        Delete user from Firebase Auth and all related Firestore documents
        """
        result = {
            "auth_deleted": False,
            "firestore_deleted": False,
            "survey_responses_deleted": 0,
            "assignments_deleted": 0,
            "errors": []
        }
        
        try:
            # 1. Delete from Firebase Auth
            try:
                get_firebase_auth().delete_user(user_uid)
                result["auth_deleted"] = True
                logger.info(f"Deleted user {user_email} from Firebase Auth")
            except auth.UserNotFoundError:
                result["errors"].append("User not found in Firebase Auth")
            except Exception as e:
                result["errors"].append(f"Auth deletion failed: {str(e)}")
            
            # 2. Delete user document from global users collection
            try:
                user_doc_ref = self.db.collection("users").document(user_uid)
                user_doc_ref.delete()
                result["firestore_deleted"] = True
                logger.info(f"Deleted user document for {user_email}")
            except Exception as e:
                result["errors"].append(f"Failed to delete user document: {str(e)}")
            
            # 3. Delete survey responses by this user
            try:
                # Find client document to access survey responses
                superadmin_id = "u1JiUOCTXxaOkoK83AFH"
                clients_ref = self.db.collection("superadmin").document(superadmin_id).collection("clients")
                client_docs = clients_ref.where("email", "==", client_email).stream()
                
                for client_doc in client_docs:
                    surveys_ref = client_doc.reference.collection("surveys")
                    survey_docs = surveys_ref.stream()
                    
                    for survey_doc in survey_docs:
                        responses_ref = survey_doc.reference.collection("responses")
                        response_docs = responses_ref.where("user_email", "==", user_email).stream()
                        
                        for response_doc in response_docs:
                            response_doc.reference.delete()
                            result["survey_responses_deleted"] += 1
                
                logger.info(f"Deleted {result['survey_responses_deleted']} survey responses")
            except Exception as e:
                result["errors"].append(f"Failed to delete survey responses: {str(e)}")
            
            # 4. Delete survey assignments for this user
            try:
                superadmin_id = "u1JiUOCTXxaOkoK83AFH"
                clients_ref = self.db.collection("superadmin").document(superadmin_id).collection("clients")
                client_docs = clients_ref.where("email", "==", client_email).stream()
                
                for client_doc in client_docs:
                    assignments_ref = client_doc.reference.collection("survey_assignments")
                    assignment_docs = assignments_ref.where("user_email", "==", user_email).stream()
                    
                    for assignment_doc in assignment_docs:
                        assignment_doc.reference.delete()
                        result["assignments_deleted"] += 1
                
                logger.info(f"Deleted {result['assignments_deleted']} survey assignments")
            except Exception as e:
                result["errors"].append(f"Failed to delete survey assignments: {str(e)}")
            
            return result
            
        except Exception as e:
            result["errors"].append(f"Unexpected error: {str(e)}")
            return result

firebase_admin_service = FirebaseAdminService()