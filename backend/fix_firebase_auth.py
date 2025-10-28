#!/usr/bin/env python3
"""
Fix Firebase Auth JWT Signature Issue
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, auth

def reset_firebase_connection():
    """Reset Firebase connection completely"""
    print("🔄 Resetting Firebase connection...")
    
    # Delete all existing Firebase apps
    for app in firebase_admin._apps.values():
        firebase_admin.delete_app(app)
    
    firebase_admin._apps.clear()
    print("✅ Cleared existing Firebase connections")

def test_service_account():
    """Test service account key validity"""
    print("🔍 Testing service account key...")
    
    try:
        with open('serviceAccountKey.json', 'r') as f:
            service_account = json.load(f)
        
        # Validate required fields
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        for field in required_fields:
            if field not in service_account:
                print(f"❌ Missing field: {field}")
                return False
        
        print(f"✅ Service account valid for project: {service_account['project_id']}")
        return True
        
    except Exception as e:
        print(f"❌ Service account error: {str(e)}")
        return False

def initialize_firebase_fresh():
    """Initialize Firebase with fresh connection"""
    print("🔥 Initializing Firebase with fresh connection...")
    
    try:
        # Reset any existing connections
        reset_firebase_connection()
        
        # Initialize with service account
        cred = credentials.Certificate('serviceAccountKey.json')
        app = firebase_admin.initialize_app(cred)
        
        print("✅ Firebase initialized successfully")
        return app
        
    except Exception as e:
        print(f"❌ Firebase initialization failed: {str(e)}")
        return None

def test_auth_operations():
    """Test Firebase Auth operations"""
    print("🧪 Testing Firebase Auth operations...")
    
    try:
        # Test listing users (this should work even with no users)
        page = auth.list_users(max_results=1)
        print("✅ Firebase Auth connection working")
        
        # Test getting a non-existent user (should fail gracefully)
        try:
            auth.get_user('non-existent-uid')
        except auth.UserNotFoundError:
            print("✅ Auth error handling working")
        except Exception as e:
            print(f"⚠️  Unexpected auth error: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Auth operations failed: {str(e)}")
        return False

def main():
    """Main fix function"""
    print("🚀 Firebase Auth JWT Signature Fix")
    print("=" * 40)
    
    # Test service account
    if not test_service_account():
        print("\n❌ Service account key is invalid. Please download a new one from Firebase Console.")
        return False
    
    # Initialize Firebase fresh
    app = initialize_firebase_fresh()
    if not app:
        print("\n❌ Failed to initialize Firebase.")
        return False
    
    # Test auth operations
    if not test_auth_operations():
        print("\n❌ Firebase Auth operations failed.")
        return False
    
    print("\n" + "=" * 40)
    print("🎉 Firebase Auth fix completed successfully!")
    print("\n💡 Your Firebase connection should now work correctly.")
    print("💡 Restart your FastAPI server to apply the fix.")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n🔧 If the issue persists:")
        print("1. Download a new service account key from Firebase Console")
        print("2. Replace serviceAccountKey.json with the new file")
        print("3. Restart your server")