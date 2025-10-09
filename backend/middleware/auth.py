from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase ID token and return user info"""
    try:
        print(f"DEBUG: Verifying token for request")
        print(f"DEBUG: Token length: {len(credentials.credentials)}")
        
        # Verify the ID token with clock skew tolerance
        decoded_token = auth.verify_id_token(credentials.credentials, clock_skew_seconds=60)
        
        # Extract user information
        user_info = {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name"),
        }
        
        print(f"DEBUG: Token verified for user: {user_info['email']}")
        return user_info
        
    except auth.InvalidIdTokenError as e:
        print(f"DEBUG: Invalid Firebase ID token: {str(e)}")
        logger.error(f"Invalid Firebase ID token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError as e:
        print(f"DEBUG: Expired Firebase ID token: {str(e)}")
        logger.error(f"Expired Firebase ID token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"DEBUG: Token verification error: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_email(user_info: dict = Depends(verify_firebase_token)) -> str:
    """Extract email from verified user info"""
    if not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not found in token"
        )
    return user_info["email"]

# Optional authentication (for public endpoints that can benefit from user context)
async def optional_auth(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """Optional authentication that doesn't raise error if no token provided"""
    if not credentials:
        return None
    
    try:
        return await verify_firebase_token(credentials)
    except HTTPException:
        return None
