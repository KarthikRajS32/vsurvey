# Survey App FastAPI Backend

This is the FastAPI backend for the Survey Application that integrates with Firebase Firestore for data persistence and Firebase Authentication for user management.

## Features

- **User Management**: CRUD operations for survey users
- **Question Management**: Create and manage survey questions with different types
- **Survey Management**: Create surveys and assign questions
- **Assignment Management**: Assign surveys to users
- **Firebase Integration**: Uses Firestore for data storage and Firebase Auth for authentication
- **RESTful API**: Well-structured REST endpoints with proper HTTP status codes
- **Data Validation**: Pydantic models for request/response validation
- **Authentication**: Firebase JWT token verification
- **CORS Support**: Configured for React frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (vsurvey-68195)
3. Go to Project Settings > Service Accounts
4. Generate a new private key
5. Save the JSON file as `serviceAccountKey.json` in the backend directory

### 3. Environment Configuration

```bash
cp .env.example .env
```

Update the `.env` file with your configuration.

### 4. Run the Application

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API Documentation**: http://localhost:8000/docs
- **Alternative Documentation**: http://localhost:8000/redoc

## API Endpoints

### Authentication
All endpoints (except health checks) require Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase-jwt-token>
```

### Users
- `POST /api/users/` - Create a new user
- `GET /api/users/` - Get paginated list of users
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user
- `PATCH /api/users/{user_id}/toggle-status` - Toggle user active status

### Questions
- `POST /api/questions/` - Create a new question
- `GET /api/questions/` - Get paginated list of questions
- `GET /api/questions/{question_id}` - Get question by ID
- `PUT /api/questions/{question_id}` - Update question
- `DELETE /api/questions/{question_id}` - Delete question
- `GET /api/questions/types/` - Get available question types

### Surveys
- `POST /api/surveys/` - Create a new survey
- `GET /api/surveys/` - Get paginated list of surveys
- `GET /api/surveys/{survey_id}` - Get survey by ID
- `PUT /api/surveys/{survey_id}` - Update survey
- `DELETE /api/surveys/{survey_id}` - Delete survey
- `POST /api/surveys/{survey_id}/questions/{question_id}` - Add question to survey
- `DELETE /api/surveys/{survey_id}/questions/{question_id}` - Remove question from survey
- `PATCH /api/surveys/{survey_id}/status` - Update survey status

### Assignments
- `POST /api/assignments/` - Assign survey to users
- `GET /api/assignments/` - Get paginated list of assignments
- `GET /api/assignments/survey/{survey_id}` - Get assignments for a survey
- `GET /api/assignments/user/{user_id}` - Get assignments for a user
- `PUT /api/assignments/{assignment_id}` - Update assignment
- `DELETE /api/assignments/{assignment_id}` - Delete assignment
- `DELETE /api/assignments/survey/{survey_id}/user/{user_id}` - Remove user from survey

## Data Models

### User
```json
{
  "id": "string",
  "full_name": "string",
  "email": "string",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "created_by": "string"
}
```

### Question
```json
{
  "id": "string",
  "text": "string",
  "type": "multiple_choice|text|rating|yes_no",
  "options": [
    {
      "id": "string",
      "text": "string",
      "order": 0
    }
  ],
  "is_required": true,
  "order": 0,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "created_by": "string"
}
```

### Survey
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "draft|active|completed|archived",
  "question_count": 0,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "created_by": "string"
}
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── models/
│   ├── database.py        # Firebase/Firestore connection
│   └── schemas.py         # Pydantic models
├── routers/
│   ├── users.py          # User endpoints
│   ├── questions.py      # Question endpoints
│   ├── surveys.py        # Survey endpoints
│   └── assignments.py    # Assignment endpoints
├── services/
│   ├── user_service.py   # User business logic
│   ├── question_service.py # Question business logic
│   ├── survey_service.py # Survey business logic
│   └── assignment_service.py # Assignment business logic
└── middleware/
    └── auth.py           # Authentication middleware
```

## Development

### Adding New Endpoints

1. Define Pydantic models in `models/schemas.py`
2. Create service class in `services/`
3. Add router in `routers/`
4. Include router in `main.py`

### Testing

You can test the API using the interactive documentation at `/docs` or with tools like Postman or curl.

Example curl request:
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Authorization: Bearer <your-firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com"
  }'
```
