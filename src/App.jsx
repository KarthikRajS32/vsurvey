import { useState, useEffect } from 'react'
import Sidebar from './components/Pages/SideBar/Sidebar'
import TopBar from './components/Pages/TapBar/TopBar'
import SurveyPersonnel from './components/Pages/Client/CreateUsers'
import Surveys from './components/Pages/Client/CreateQuestion'
import CreateSurvey from './components/Pages/Client/CreateSurveys'
import Login from './components/Pages/LoginPage/Login'
import { supabase } from './lib/supabaseClient'
import AssignUser from "./components/Pages/Client/AssignUser";
import SuperAdminDashboard from "./components/Pages/SuperAdmin/SuperAdminDashboard";
import ProfileSetup from './components/Pages/Client/ProfileSetup';
import ClientAdminHeader from './components/Pages/Client/ClientAdminHeader';


function App() {
  const [activeTab, setActiveTab] = useState('personnel')
  const [session, setSession] = useState(false)
  const [userType, setUserType] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clientAdminData, setClientAdminData] = useState(null)
  const [showProfileEdit, setShowProfileEdit] = useState(false)

  const handleLogout = () => {
    setSession(false)
    setUserType(null)
    setActiveTab('personnel')
    setClientAdminData(null)
    setShowProfileEdit(false)
    localStorage.removeItem('currentClientAdmin')
  }

  const handleProfileComplete = (profileData) => {
    setClientAdminData({ ...clientAdminData, profile: profileData, isFirstTime: false })
    setShowProfileEdit(false)
  }

  const handleProfileEdit = () => {
    setShowProfileEdit(true)
  }

  const handleCreateSurvey = () => {
    setActiveTab('surveys')
  }

  const handleNavigateToSurveys = () => {
    setActiveTab('surveys')
  }

  useEffect(() => {
    // Check if coming from email link (including hash parameters)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hasAccessToken = hashParams.has('access_token')
    
    if (hasAccessToken) {
      setSession(false)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Check for existing client admin session
    const savedUser = localStorage.getItem('currentClientAdmin')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      const profile = localStorage.getItem(`profile_${user.email}`)
      if (profile) {
        const profileData = JSON.parse(profile)
        setClientAdminData({ email: user.email, profile: profileData, isFirstTime: false })
        setUserType('client')
        setSession(true)
      }
    }

    // Listen for auth changes (email link clicks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return <SurveyPersonnel profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
      case "Questions":
        return <Surveys profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
      case "surveys":
        return <CreateSurvey profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
      case "assignuser":
        return <AssignUser profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
      default:
        return <SurveyPersonnel profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!session ? (
        <Login onLogin={(type, data) => {
          setUserType(type)
          if (type === 'client') {
            setClientAdminData(data)
            localStorage.setItem('currentClientAdmin', JSON.stringify({ email: data.email }))
          }
          setSession(true)
        }} />
      ) : userType === 'superadmin' ? (
        <SuperAdminDashboard />
      ) : clientAdminData?.isFirstTime || showProfileEdit ? (
        <ProfileSetup 
          email={clientAdminData.email} 
          onComplete={handleProfileComplete}
          isEdit={showProfileEdit}
          existingProfile={clientAdminData?.profile}
        />
      ) : (
        <>
          <TopBar setActiveTab={setActiveTab} onLogout={handleLogout} />
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSidebarToggle={setSidebarOpen} />
          <main className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }`}>
            {renderContent()}
          </main>
        </>
      )}
    </div>
  )
}

export default App