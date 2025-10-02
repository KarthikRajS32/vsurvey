# Migration Guide: Local Storage to Firebase + FastAPI

This guide will help you migrate your existing React survey application from local storage to Firebase authentication and FastAPI backend with Firestore database.

## 📋 Overview

The migration involves:
1. Setting up Firebase Authentication
2. Setting up FastAPI backend with Firestore
3. Replacing local storage components with API-integrated versions
4. Updating authentication flow
5. Testing the new implementation

## 🔧 Step-by-Step Migration

### Step 1: Backend Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   python setup.py
   ```

2. **Configure Firebase**
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it in the `backend/` directory
   - Update `.env` file with your Firebase project ID

3. **Start Backend Server**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload
   ```

### Step 2: Frontend Updates

1. **Update Firebase Configuration**
   - Replace `src/firebase.js` with the new version that includes Firestore and Auth

2. **Install New Dependencies** (if needed)
   ```bash
   npm install firebase
   ```

### Step 3: Component Migration

Replace your existing components with API-integrated versions:

#### Users Component Migration

**Before (Local Storage):**
```javascript
// src/components/Pages/Client/CreateUsers.jsx
const [users, setUsers] = useState([])

useEffect(() => {
  const savedUsers = localStorage.getItem('users')
  if (savedUsers) {
    setUsers(JSON.parse(savedUsers))
  }
}, [])

const handleSubmit = (e) => {
  e.preventDefault()
  const newUser = { id: Date.now(), ...formData }
  const updatedUsers = [newUser, ...users]
  setUsers(updatedUsers)
  localStorage.setItem('users', JSON.stringify(updatedUsers))
}
```

**After (API Integration):**
```javascript
// src/components/Pages/Client/CreateUsersAPI.jsx
import { useUsers } from '../../../hooks/useApi'

const { users, loading, error, fetchUsers, createUser } = useUsers()

useEffect(() => {
  fetchUsers()
}, [])

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    await createUser(formData)
    setMessage('User created successfully!')
  } catch (err) {
    setMessage(err.message)
  }
}
```

#### Update App.jsx

Replace component imports:
```javascript
// Before
import SurveyPersonnel from './components/Pages/Client/CreateUsers'

// After
import SurveyPersonnel from './components/Pages/Client/CreateUsersAPI'
```

### Step 4: Authentication Integration

1. **Update Login Component**
   ```javascript
   import authService from '../../../services/authService'
   
   const handleLogin = async (email, password) => {
     const result = await authService.signIn(email, password)
     if (result.success) {
       onLogin('client', { email: result.user.email })
     } else {
       setError(result.message)
     }
   }
   ```

2. **Update App.jsx Authentication Flow**
   ```javascript
   import authService from './services/authService'
   
   useEffect(() => {
     const unsubscribe = authService.onAuthStateChange((user) => {
       if (user) {
         setSession(true)
         setUserType('client')
         setClientAdminData({ email: user.email })
       } else {
         setSession(false)
         setUserType(null)
       }
     })
     
     return unsubscribe
   }, [])
   ```

### Step 5: Data Migration (Optional)

If you have existing data in local storage, you can migrate it:

1. **Export Local Storage Data**
   ```javascript
   const exportLocalData = () => {
     const users = JSON.parse(localStorage.getItem('users') || '[]')
     const questions = JSON.parse(localStorage.getItem('questions') || '[]')
     const surveys = JSON.parse(localStorage.getItem('surveys') || '[]')
     
     return { users, questions, surveys }
   }
   ```

2. **Import to API**
   ```javascript
   const importToAPI = async (data) => {
     // Import users
     for (const user of data.users) {
       await apiService.createUser({
         full_name: user.fullName,
         email: user.email
       })
     }
     
     // Import questions
     for (const question of data.questions) {
       await apiService.createQuestion({
         text: question.text,
         type: question.type,
         options: question.options || []
       })
     }
     
     // Import surveys
     for (const survey of data.surveys) {
       await apiService.createSurvey({
         title: survey.title,
         description: survey.description,
         question_ids: survey.questionIds || []
       })
     }
   }
   ```

## 🔄 Component Replacement Checklist

- [ ] `CreateUsers.jsx` → `CreateUsersAPI.jsx`
- [ ] `CreateQuestion.jsx` → `CreateQuestionAPI.jsx` (to be created)
- [ ] `CreateSurveys.jsx` → `CreateSurveysAPI.jsx` (to be created)
- [ ] `AssignUser.jsx` → `AssignUserAPI.jsx` (to be created)
- [ ] Update `Login.jsx` with Firebase authentication
- [ ] Update `App.jsx` with new authentication flow

## 🧪 Testing Migration

1. **Test Authentication**
   - Sign up new user
   - Sign in existing user
   - Sign out functionality

2. **Test CRUD Operations**
   - Create new users/questions/surveys
   - Read/list existing data
   - Update existing records
   - Delete records

3. **Test Pagination**
   - Navigate through pages
   - Search functionality
   - Filter options

## 🚨 Common Issues and Solutions

### Issue: CORS Errors
**Solution:** Ensure backend CORS is configured for your frontend URL:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Authentication Token Not Found
**Solution:** Ensure user is signed in before making API calls:
```javascript
const { loading, error, execute } = useApi()

useEffect(() => {
  if (authService.isAuthenticated()) {
    fetchUsers()
  }
}, [])
```

### Issue: Firebase Configuration Errors
**Solution:** Double-check Firebase config in `src/firebase.js` and ensure all services are properly initialized.

## 📈 Performance Considerations

1. **Pagination**: Use pagination for large datasets
2. **Caching**: Implement client-side caching for frequently accessed data
3. **Debouncing**: Add debouncing for search functionality
4. **Loading States**: Show loading indicators for better UX

## 🔒 Security Best Practices

1. **Firebase Rules**: Configure Firestore security rules
2. **Token Validation**: Ensure all API endpoints validate Firebase tokens
3. **Input Validation**: Validate all user inputs on both client and server
4. **Error Handling**: Don't expose sensitive information in error messages

## 📝 Next Steps

After successful migration:

1. **Remove Local Storage Code**: Clean up old local storage implementations
2. **Add Tests**: Implement unit and integration tests
3. **Error Monitoring**: Add error tracking (e.g., Sentry)
4. **Performance Monitoring**: Monitor API performance and optimize as needed
5. **Documentation**: Update component documentation

## 🎯 Success Criteria

Migration is complete when:
- [ ] All CRUD operations work through API
- [ ] Authentication is handled by Firebase
- [ ] No local storage dependencies remain
- [ ] All existing functionality is preserved
- [ ] Performance is acceptable
- [ ] Error handling is robust

---

**Need Help?** Check the main README.md for troubleshooting tips or create an issue in the repository.
