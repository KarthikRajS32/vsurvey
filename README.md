# V-Survey App

A comprehensive survey management platform with multi-tenant architecture supporting SuperAdmin, Client Admin, and End User roles.

## 🚀 Live Demo

- **Frontend**: https://v-survey-app.netlify.app/
- **Backend API**: https://v-survey-backend.onrender.com

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Deployment**: Netlify

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Authentication**: Firebase Admin SDK
- **Database**: Firebase Firestore
- **Deployment**: Render (Docker)

## 👥 User Roles

### SuperAdmin
- Create and manage Client Admins
- View all client statistics and data
- Manage system-wide settings
- Monitor survey results across all clients

### Client Admin
- Create and manage end users
- Design surveys and questions
- Assign surveys to users
- View survey responses and analytics

### End User (Mobile)
- Receive survey assignments
- Complete assigned surveys
- View survey history

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- shadcn/ui
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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Firebase Project

### Local Development

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

#### Backend (.env)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

#### Frontend (.env)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📁 Project Structure

```
v-surveyapp/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   └── firebase.js      # Firebase config
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── models/             # Data models
│   ├── routers/            # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Auth middleware
│   └── main.py            # FastAPI app
└── README.md
```

## 🔐 Authentication Flow

1. **SuperAdmin**: Pre-configured admin access
2. **Client Admin**: Created by SuperAdmin, receives setup email
3. **End User**: Created by Client Admin, receives activation email

## 📊 Features

### SuperAdmin Dashboard
- Client management (create, edit, delete)
- Real-time client status monitoring
- System-wide analytics
- User authentication management

### Client Admin Dashboard
- User management with status tracking
- Survey builder with multiple question types
- Survey assignment system
- Response analytics and reporting

### Survey Management
- Multiple question types (text, multiple choice, rating, yes/no)
- Survey assignment to specific users
- Real-time response tracking
- Duplicate prevention system

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

## 🔒 Security Features

- Firebase Authentication integration
- Role-based access control
- CORS protection
- Input validation with Pydantic
- Secure environment variable handling

## 📱 Mobile Support

- Responsive design for all screen sizes
- Mobile-optimized survey interface
- Touch-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.