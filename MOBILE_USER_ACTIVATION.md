# Mobile User Activation API

## Overview
When users are created through the web app, they start with `status = "pending"` and `is_active = false`. 

On first mobile login, the mobile app should call the activation API to automatically update these fields to `status = "active"` and `is_active = true`.

## API Endpoint

**POST** `/api/users/activate-on-login`

### Headers
```
Authorization: Bearer <firebase-jwt-token>
Content-Type: application/json
```

### Request
No request body needed. The user email is extracted from the Firebase JWT token.

### Response
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "user-firebase-uid",
    "email": "user@example.com",
    "full_name": "User Name",
    "status": "active",
    "is_active": true,
    "activatedAt": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

## Mobile App Integration

### When to Call
Call this endpoint immediately after successful Firebase authentication on the mobile app, but only on the first login after password setup.

### Example Implementation
```javascript
// After successful Firebase login
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

try {
  const response = await fetch('http://your-api-url/api/users/activate-on-login', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('User activated:', result.data);
    // Proceed with app flow
  }
} catch (error) {
  console.error('Activation failed:', error);
  // Handle error - user can still use app
}
```

## Backend Setup

1. Ensure the backend server is running on port 8000
2. The API endpoint is available at: `http://localhost:8000/api/users/activate-on-login`
3. For production, update the URL accordingly

## Notes

- The API is idempotent - calling it multiple times won't cause issues
- If user is already active, it returns success with current user data
- Only users with `status = "pending"` will be updated to `status = "active"`
- The Firebase JWT token must be valid and contain the user's email