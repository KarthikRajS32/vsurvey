# Render Deployment Guide

## Prerequisites Completed ✅

1. **`.gitignore`** - Excludes sensitive files (env, serviceAccountKey.json, etc.)
2. **`render.yaml`** - Render service configuration
3. **`runtime.txt`** - Python version specification
4. **`requirements.txt`** - Updated to avoid Rust compilation errors
5. **`main.py`** - Production-ready with dynamic port and CORS

## Environment Variables to Set in Render

Before deploying, set these environment variables in your Render dashboard:

### Required Variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Your Firebase private key (from serviceAccountKey.json)
- `FIREBASE_CLIENT_EMAIL` - Your Firebase client email
- `FRONTEND_URL` - Your frontend domain (e.g., https://your-app.netlify.app)

### Optional Variables:
- `PYTHON_VERSION` - Already set in render.yaml (3.11.0)
- `PORT` - Automatically provided by Render

## Deployment Steps

1. **Push to GitHub** (make sure .gitignore excludes sensitive files)
2. **Connect to Render**:
   - Go to Render dashboard
   - Create new Web Service
   - Connect your GitHub repository
   - Select the backend folder as root directory

3. **Configure Build Settings**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables** in Render dashboard

5. **Deploy**

## Firebase Service Account Setup

Since `serviceAccountKey.json` is excluded from deployment, you need to set Firebase credentials as environment variables:

1. From your `serviceAccountKey.json`, extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

2. Update your Firebase initialization code to use environment variables instead of the JSON file.

## Troubleshooting

The previous Rust/Cargo error was caused by:
- `uvicorn[standard]` extra dependencies
- `pydantic[email]` extra dependencies  
- `python-jose[cryptography]` extra dependencies
- `passlib[bcrypt]` extra dependencies

These have been fixed by:
- Removing extra dependencies that require Rust compilation
- Pinning `cryptography==41.0.7` for compatibility
- Using base packages without extras