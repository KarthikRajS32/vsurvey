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


function App() {
  const [activeTab, setActiveTab] = useState('personnel')
  const [session, setSession] = useState(false)
  const [userType, setUserType] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    setSession(false)
    setUserType(null)
    setActiveTab('personnel')
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
        return <SurveyPersonnel />;
      case "Questions":
        return <Surveys />;
      case "surveys":
        return <CreateSurvey />;
      case "assignuser":
        return <AssignUser />;
      default:
        return <SurveyPersonnel />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <Login onLogin={(type) => {
          setUserType(type)
          setSession(true)
        }} />
      ) : userType === 'superadmin' ? (
        <SuperAdminDashboard />
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