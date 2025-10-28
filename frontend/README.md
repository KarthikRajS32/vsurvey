# Survey Application

A full-stack survey management application built with React (frontend) and FastAPI (backend), integrated with Firebase for authentication and Firestore for data persistence.

## 🚀 Features

### Frontend (React + Vite)
- **User Management**: Create, edit, and manage survey participants
- **Question Management**: Create different types of questions (multiple choice, text, rating, yes/no)
- **Survey Management**: Build surveys by combining questions
- **Assignment Management**: Assign surveys to specific users
- **Firebase Authentication**: Secure user authentication
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization

### Backend (FastAPI)
- **RESTful API**: Well-structured REST endpoints
- **Firebase Integration**: Firestore database and Firebase Auth
- **Data Validation**: Pydantic models for request/response validation
- **Authentication Middleware**: JWT token verification
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Pagination**: Efficient data loading with pagination
- **Error Handling**: Comprehensive error handling and logging

## 🏗️ Architecture

```
v-surveyapp/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API and auth services
│   │   ├── hooks/           # Custom React hooks
│   │   └── firebase.js      # Firebase configuration
│   └── package.json
├── backend/                  # FastAPI application
│   ├── main.py              # Application entry point
│   ├── models/              # Data models and database
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   ├── middleware/          # Authentication middleware
│   └── requirements.txt
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Firebase SDK** - Authentication and Firestore
- **Lucide React** - Icons
- **Radix UI** - UI components

### Backend
- **FastAPI** - Python web framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Google Cloud Firestore** - NoSQL database

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Firebase Project** with Firestore enabled
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd v-surveyapp
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Enable **Authentication** and **Firestore Database**
4. Get your Firebase configuration from Project Settings
5. Generate a service account key for the backend

### 3. Backend Setup

```bash
cd backend

# Run the setup script (recommended)
python setup.py

# Or manual setup:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

**Important**: Add your Firebase service account key as `serviceAccountKey.json` in the backend directory.

### 4. Frontend Setup

```bash
cd ../  # Go back to project root
npm install
```

Update `src/firebase.js` with your Firebase configuration.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend:**
Update `src/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- **Users**: `/api/users/` - Manage survey participants
- **Questions**: `/api/questions/` - Manage survey questions
- **Surveys**: `/api/surveys/` - Manage surveys
- **Assignments**: `/api/assignments/` - Manage survey assignments

### Authentication

All API endpoints require Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase-jwt-token>
```

## 🗄️ Database Schema

### Collections in Firestore

1. **users** - Survey participants
2. **questions** - Survey questions
3. **surveys** - Survey definitions
4. **survey_questions** - Question-survey mappings
5. **survey_assignments** - User-survey assignments
6. **survey_responses** - User responses (future feature)
7. **client_admins** - Admin user profiles

## 🔄 Migration from Local Storage

The application currently uses local storage for data persistence. To migrate to the Firebase/FastAPI backend:

1. **Update Components**: Replace local storage components with API-integrated versions
2. **Authentication**: Implement Firebase authentication in login flow
3. **Data Migration**: Export existing local storage data and import via API
4. **Testing**: Thoroughly test all CRUD operations

### Example Migration

Replace the existing `CreateUsers.jsx` with `CreateUsersAPI.jsx`:

```javascript
// Old: Local storage
const users = JSON.parse(localStorage.getItem('users') || '[]');

// New: API integration
import { useUsers } from '../../../hooks/useApi';
const { users, fetchUsers, createUser } = useUsers();
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest  # After implementing tests
```

### Frontend Testing
```bash
npm test  # After implementing tests
```

## 🚀 Deployment

### Backend Deployment (Google Cloud Run)
```bash
# Build and deploy
gcloud run deploy survey-api --source .
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- **Frontend**: Use ESLint and Prettier
- **Backend**: Follow PEP 8 Python style guide
- **Commits**: Use conventional commit messages

### File Structure
- Keep components small and focused
- Use custom hooks for API logic
- Separate business logic into services
- Follow the established folder structure

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify Firebase configuration
   - Check if Authentication is enabled in Firebase Console
   - Ensure service account key is correctly placed

2. **CORS Errors**
   - Update CORS_ORIGINS in backend .env file
   - Restart the backend server

3. **API Connection Issues**
   - Verify backend is running on port 8000
   - Check if API_BASE_URL in frontend matches backend URL

4. **Database Permission Errors**
   - Verify Firestore security rules
   - Check service account permissions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication and database services
- FastAPI for the excellent Python web framework
- React team for the amazing frontend framework
- All open-source contributors

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation at `/docs` endpoint
- Review the troubleshooting section above

---

**Happy coding! 🎉**
