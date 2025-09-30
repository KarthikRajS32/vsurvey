import { useState, useEffect } from "react"
import ClientAdminLogin from "./ClientAdminLogin"
import ProfileSetup from "./ProfileSetup"
import CreateUsers from "./CreateUsers"

const ClientAdminDashboard = () => {
  const [currentView, setCurrentView] = useState('login') // 'login', 'profile-setup', 'dashboard', 'profile-edit'
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentClientAdmin')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      
      // Load profile
      const profile = localStorage.getItem(`profile_${user.email}`)
      if (profile) {
        const profileData = JSON.parse(profile)
        setUserProfile(profileData)
        setCurrentView('dashboard')
      } else {
        setCurrentView('profile-setup')
      }
    }
  }, [])

  const handleLogin = (email, isFirstTime) => {
    const userData = { email }
    setCurrentUser(userData)
    localStorage.setItem('currentClientAdmin', JSON.stringify(userData))
    
    if (isFirstTime) {
      setCurrentView('profile-setup')
    } else {
      // Load existing profile
      const profile = localStorage.getItem(`profile_${email}`)
      if (profile) {
        const profileData = JSON.parse(profile)
        setUserProfile(profileData)
        setCurrentView('dashboard')
      } else {
        setCurrentView('profile-setup')
      }
    }
  }

  const handleProfileComplete = (profileData) => {
    setUserProfile(profileData)
    setCurrentView('dashboard')
  }

  const handleProfileEdit = () => {
    setCurrentView('profile-edit')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentClientAdmin')
    setCurrentUser(null)
    setUserProfile(null)
    setCurrentView('login')
  }

  const handleProfileUpdate = (profileData) => {
    setUserProfile(profileData)
    setCurrentView('dashboard')
  }

  if (currentView === 'login') {
    return <ClientAdminLogin onLogin={handleLogin} />
  }

  if (currentView === 'profile-setup') {
    return (
      <ProfileSetup 
        email={currentUser.email} 
        onComplete={handleProfileComplete}
      />
    )
  }

  if (currentView === 'profile-edit') {
    return (
      <ProfileSetup 
        email={currentUser.email} 
        onComplete={handleProfileUpdate}
        isEdit={true}
        existingProfile={userProfile}
      />
    )
  }

  if (currentView === 'dashboard') {
    return (
      <CreateUsers 
        profile={userProfile}
        onProfileEdit={handleProfileEdit}
        onLogout={handleLogout}
      />
    )
  }

  return null
}

export default ClientAdminDashboard