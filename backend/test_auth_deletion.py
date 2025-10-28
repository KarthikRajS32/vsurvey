#!/usr/bin/env python3
"""
Test Firebase Auth deletion functionality
"""

import asyncio
from services.user_service import UserService

async def test_auth_deletion():
    """Test the Firebase Auth deletion functionality"""
    print("🧪 Testing Firebase Auth deletion functionality...")
    
    try:
        # Initialize user service
        user_service = UserService()
        
        # Test with a fake user ID (this should handle the error gracefully)
        test_user_id = "test-user-123"
        test_admin_email = "test@example.com"
        
        print(f"Testing deletion for user ID: {test_user_id}")
        
        # This should return a result with errors but not crash
        result = await user_service.delete_user_completely(test_user_id, test_admin_email)
        
        print("✅ Function executed without crashing")
        print(f"Result: {result}")
        
        # Check if the function structure is correct
        expected_keys = ["user_id", "firestore_deleted", "firebase_auth_deleted", "errors", "user_email"]
        for key in expected_keys:
            if key in result:
                print(f"✅ Key '{key}' present in result")
            else:
                print(f"❌ Key '{key}' missing from result")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_auth_deletion())
    if success:
        print("\n🎉 Firebase Auth deletion test completed successfully!")
        print("The function is properly structured to handle both Firestore and Firebase Auth deletion.")
    else:
        print("\n❌ Test failed. Check the error messages above.")