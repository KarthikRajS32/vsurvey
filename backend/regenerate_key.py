#!/usr/bin/env python3
"""
Instructions to regenerate Firebase service account key
"""

print("FIREBASE SERVICE ACCOUNT KEY REGENERATION REQUIRED")
print("=" * 60)
print()
print("Your current service account key has an invalid JWT signature.")
print("You need to generate a new service account key:")
print()
print("STEPS:")
print("1. Go to Firebase Console: https://console.firebase.google.com/")
print("2. Select your project: vsurvey-68195")
print("3. Go to Project Settings (gear icon)")
print("4. Click on 'Service accounts' tab")
print("5. Click 'Generate new private key'")
print("6. Download the JSON file")
print("7. Replace 'serviceAccountKey.json' with the new file")
print("8. Restart your FastAPI server")
print()
print("ALTERNATIVE - Quick Fix:")
print("Delete the current key and regenerate:")

import os
if os.path.exists('serviceAccountKey.json'):
    print("Current key found. You can:")
    print("1. Backup: copy serviceAccountKey.json serviceAccountKey.json.backup")
    print("2. Delete: del serviceAccountKey.json")
    print("3. Download new key from Firebase Console")
    print("4. Save as serviceAccountKey.json")
else:
    print("No service account key found. Download from Firebase Console.")

print()
print("After replacing the key, test with:")
print("python test_deletion.py")