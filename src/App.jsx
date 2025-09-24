import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SurveyPersonnel from './components/CreateUsers'
import Surveys from './components/CreateQuestion'
import CreateSurvey from './components/CreateSurveys'
import SetPassword from './components/SetPassword'
import Login from './components/Login'
import { supabase } from './lib/supabaseClient'
import AssignUser from "./components/AssignUser";
import SuperAdminDashboard from "./components/SuperAdminDashboard";


function App() {
  const [activeTab, setActiveTab] = useState('personnel')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState(false)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSession(false)
    setShowPasswordScreen(false)
    setActiveTab('personnel')
  }

  useEffect(() => {
    // Check if coming from email link (including hash parameters)
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || 
                         hashParams.has('access_token') || hashParams.has('refresh_token') ||
                         hashParams.has('error')
    
    if (hasAuthParams) {
      setIsAuthenticated(true)
      setShowPasswordScreen(true)
      setSession(false)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Listen for auth changes (email link clicks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        setShowPasswordScreen(true)
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
      case "superadmin":
        return <SuperAdminDashboard />
      default:
        return <SurveyPersonnel />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <Login onLogin={() => setIsAuthenticated(true)} />
      ) : showPasswordScreen ? (
        <SetPassword onPasswordSet={() => {
          setSession(true)
          setShowPasswordScreen(false)
        }} />
      ) : session ? (
        <>
          <TopBar setActiveTab={setActiveTab} onLogout={handleLogout} />
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSidebarToggle={setSidebarOpen} />
          <main className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }`}>
            {renderContent()}
          </main>
        </>
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
