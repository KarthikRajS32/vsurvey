# V-Survey App

A comprehensive survey management platform with multi-tenant architecture supporting SuperAdmin, Client Admin, and End User roles. Built with React (frontend) and FastAPI (backend), integrated with Firebase for authentication and Firestore for data persistence.

## 🚀 Live Demo

- **Frontend**: https://v-survey-app.netlify.app/
- **Backend API**: https://v-survey-backend.onrender.com
- **API Documentation**: https://v-survey-backend.onrender.com/docs

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Deployment**: Netlify
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works on desktop and mobile devices

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Authentication**: Firebase Admin SDK
- **Database**: Firebase Firestore
- **Deployment**: Render (Docker)
- **Data Validation**: Pydantic models for request/response validation
- **Authentication Middleware**: JWT token verification
- **Error Handling**: Comprehensive error handling and logging

## 👥 User Roles

### SuperAdmin
- Create and manage Client Admins
- View all client statistics and data
- Manage system-wide settings
- Monitor survey results across all clients
- Real-time client status monitoring
- Automatic user deactivation when client is deactivated

### Client Admin
- Create and manage end users
- Design surveys and questions
- Assign surveys to users
- View survey responses and analytics
- User management with status tracking
- Survey builder with multiple question types
- Duplicate prevention system

### End User (Mobile)
- Receive survey assignments
- Complete assigned surveys
- View survey history
- Mobile-optimized survey interface

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Firebase SDK
- Lucide React Icons

**Backend:**
- FastAPI
- Python 3.9
- Firebase Admin SDK
- Pydantic
- Uvicorn

**Database & Auth:**
- Firebase Firestore
- Firebase Authentication

**Deployment:**
- Frontend: Netlify
- Backend: Render (Docker)

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Firebase Project** with Firestore enabled
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd v-survey-react-app
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Enable **Authentication** and **Firestore Database**
4. Get your Firebase configuration from Project Settings
5. Generate a service account key for the backend

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Update `src/firebase.js` with your Firebase configuration:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### 4. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Important**: Add your Firebase service account key as `serviceAccountKey.json` in the backend directory.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Environment Variables

### Backend (.env)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📁 Project Structure

```
v-survey-react-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Pages/        # Page components
│   │   │   │   ├── Client/   # Client admin pages
│   │   │   │   ├── SuperAdmin/ # Super admin pages
│   │   │   │   └── LoginPage/ # Authentication
│   │   │   └── ui/           # UI components
│   │   ├── services/         # API and auth services
│   │   ├── hooks/           # Custom React hooks
│   │   └── firebase.js      # Firebase configuration
│   └── package.json
├── backend/                  # FastAPI application
│   ├── main.py              # Application entry point
│   ├── models/              # Data models
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   ├── middleware/          # Authentication middleware
│   └── requirements.txt
└── README.md
```

## 🔐 Authentication Flow

1. **SuperAdmin**: Pre-configured admin access (superadmin@vsurvey.com)
2. **Client Admin**: Created by SuperAdmin, receives setup email
3. **End User**: Created by Client Admin, receives activation email
4. **Auto-logout**: Deactivated users are automatically logged out
5. **Account Deactivation**: Shows appropriate message and redirects to login

## 📊 Features

### SuperAdmin Dashboard
- Client management (create, edit, delete, activate/deactivate)
- Real-time client status monitoring
- System-wide analytics
- User authentication management
- Automatic user deactivation when client is deactivated
- Client details modal with user/survey statistics

### Client Admin Dashboard
- User management with status tracking
- Survey builder with multiple question types
- Survey assignment system with duplicate prevention
- Response analytics and reporting
- Profile setup and management
- Real-time data synchronization

### Survey Management
- Multiple question types (text, multiple choice, rating, yes/no)
- Survey assignment to specific users
- Real-time response tracking
- Duplicate prevention system
- Survey results and analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `DELETE /api/users/{uid}/auth` - Delete user from Firebase Auth

### Users
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Surveys
- `GET /api/surveys` - List surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/{id}` - Get survey details
- `PUT /api/surveys/{id}` - Update survey

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `PUT /api/questions/{id}` - Update question

### Assignments
- `GET /api/assignments/` - List survey assignments
- `POST /api/assignments/` - Create survey assignment

**Authentication**: All API endpoints require Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase-jwt-token>
```

## 🗄️ Database Schema

### Collections in Firestore

1. **superadmin/U0UjGVvDJoDbLtWAhyjp/clients** - Client admin profiles
2. **users** - Survey participants (global collection)
3. **superadmin/U0UjGVvDJoDbLtWAhyjp/clients/{clientId}/questions** - Survey questions
4. **superadmin/U0UjGVvDJoDbLtWAhyjp/clients/{clientId}/surveys** - Survey definitions
5. **superadmin/U0UjGVvDJoDbLtWAhyjp/clients/{clientId}/assignments** - Survey assignments
6. **survey_responses** - User responses (future feature)

## 🚀 Deployment

### Frontend (Netlify)
```bash
# Build command
npm run build

# Publish directory
dist

# Base directory
frontend
```

### Backend (Render)
- **Environment**: Docker
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Backend Deployment (Google Cloud Run)
```bash
# Build and deploy
gcloud run deploy survey-api --source .
```

## 🔒 Security Features

- Firebase Authentication integration
- Role-based access control
- CORS protection
- Input validation with Pydantic
- Secure environment variable handling
- Real-time status monitoring
- Automatic session management

## 📱 Mobile Support

- Responsive design for all screen sizes
- Mobile-optimized survey interface
- Touch-friendly interactions
- Progressive Web App capabilities

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest  # After implementing tests
```

### Frontend Testing
```bash
cd frontend
npm test  # After implementing tests
```

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

5. **Account Deactivation Issues**
   - Check client status in SuperAdmin dashboard
   - Verify real-time listeners are working
   - Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

#### Code Style
- **Frontend**: Use ESLint and Prettier
- **Backend**: Follow PEP 8 Python style guide
- **Commits**: Use conventional commit messages

#### File Structure
- Keep components small and focused
- Use custom hooks for API logic
- Separate business logic into services
- Follow the established folder structure

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Firebase for authentication and database services
- FastAPI for the excellent Python web framework
- React team for the amazing frontend framework
- Tailwind CSS for the utility-first CSS framework
- shadcn/ui for beautiful UI components
- All open-source contributors

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs` endpoint
- Review the troubleshooting section above
- Contact the development team

---

**Happy coding! 🎉**