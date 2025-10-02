#!/usr/bin/env python3
"""
Setup script for Survey App FastAPI Backend
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")

def create_virtual_environment():
    """Create and activate virtual environment"""
    if not os.path.exists("venv"):
        run_command("python -m venv venv", "Creating virtual environment")
    
    # Activation command varies by OS
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print(f"📝 To activate virtual environment, run: {activate_cmd}")
    return pip_cmd

def install_dependencies(pip_cmd):
    """Install Python dependencies"""
    run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip")
    run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies")

def create_env_file():
    """Create .env file from template if it doesn't exist"""
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            run_command("cp .env.example .env", "Creating .env file from template")
            print("📝 Please update the .env file with your configuration")
        else:
            print("⚠️  .env.example not found, please create .env file manually")
    else:
        print("✅ .env file already exists")

def check_firebase_setup():
    """Check if Firebase service account key exists"""
    if not os.path.exists("serviceAccountKey.json"):
        print("⚠️  Firebase service account key not found")
        print("📝 Please download serviceAccountKey.json from Firebase Console:")
        print("   1. Go to Firebase Console > Project Settings > Service Accounts")
        print("   2. Click 'Generate new private key'")
        print("   3. Save the file as 'serviceAccountKey.json' in the backend directory")
        return False
    else:
        print("✅ Firebase service account key found")
        return True

def create_directory_structure():
    """Create necessary directories"""
    directories = [
        "models",
        "routers", 
        "services",
        "middleware",
        "tests"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        # Create __init__.py files for Python packages
        init_file = Path(directory) / "__init__.py"
        if not init_file.exists():
            init_file.touch()
    
    print("✅ Directory structure created")

def main():
    """Main setup function"""
    print("🚀 Setting up Survey App FastAPI Backend")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Create directory structure
    create_directory_structure()
    
    # Create virtual environment
    pip_cmd = create_virtual_environment()
    
    # Install dependencies
    install_dependencies(pip_cmd)
    
    # Create .env file
    create_env_file()
    
    # Check Firebase setup
    firebase_ready = check_firebase_setup()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    
    print("2. Update .env file with your configuration")
    
    if not firebase_ready:
        print("3. Add Firebase service account key (serviceAccountKey.json)")
        print("4. Run the application: uvicorn main:app --reload")
    else:
        print("3. Run the application: uvicorn main:app --reload")
    
    print("\n🌐 The API will be available at: http://localhost:8000")
    print("📚 API documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
