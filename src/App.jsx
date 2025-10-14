// import { useState, useEffect } from 'react'
// import Sidebar from './components/Pages/SideBar/Sidebar'
// import TopBar from './components/Pages/TapBar/TopBar'
// import SurveyPersonnel from './components/Pages/Client/CreateUsersAPI'
// import Surveys from './components/Pages/Client/CreateQuestionAPI'
// import CreateSurvey from './components/Pages/Client/CreateSurveys'
// import Login from './components/Pages/LoginPage/Login'
// import { supabase } from './lib/supabaseClient'
// import AssignUser from "./components/Pages/Client/AssignUser";
// import SuperAdminDashboard from "./components/Pages/SuperAdmin/SuperAdminDashboardAPI";
// import ProfileSetup from './components/Pages/Client/ProfileSetup';
// import ClientAdminHeader from './components/Pages/Client/ClientAdminHeader';
// import { auth } from './firebase'

// function App() {
//   const [activeTab, setActiveTab] = useState('personnel')
//   const [session, setSession] = useState(false)
//   const [userType, setUserType] = useState(null)
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [clientAdminData, setClientAdminData] = useState(null)
//   const [showProfileEdit, setShowProfileEdit] = useState(false)

//   const handleLogout = () => {
//     setSession(false)
//     setUserType(null)
//     setActiveTab('personnel')
//     setClientAdminData(null)
//     setShowProfileEdit(false)
//     localStorage.removeItem('currentClientAdmin')
//   }

//   const handleProfileComplete = (profileData) => {
//     setClientAdminData({ ...clientAdminData, profile: profileData, isFirstTime: false })
//     setShowProfileEdit(false)
//   }

//   const handleProfileEdit = () => {
//     setShowProfileEdit(true)
//   }

//   const handleCreateSurvey = () => {
//     setActiveTab('surveys')
//   }

//   const handleNavigateToSurveys = () => {
//     setActiveTab('surveys')
//   }

//   useEffect(() => {
//     // Check if coming from email link (including hash parameters)
//     const hashParams = new URLSearchParams(window.location.hash.substring(1))
//     const hasAccessToken = hashParams.has('access_token')

//     if (hasAccessToken) {
//       setSession(false)
//       // Clear URL parameters
//       window.history.replaceState({}, document.title, window.location.pathname)
//     }

//     // Listen for Firebase auth state changes
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         console.log('Auth state changed:', user.email)

//         // Check if it's superadmin by email
//         if (user.email === 'superadmin@vsurvey.com') {
//           console.log('SuperAdmin detected, staying on SuperAdmin dashboard')
//           return
//         }

//         // Skip navigation if we're in the middle of creating a user
//         if (window.isCreatingUser) {
//           console.log('User creation in progress, skipping navigation')
//           return
//         }

//         console.log('Client user detected, redirecting to client dashboard')
//         // For regular clients
//         setClientAdminData({ email: user.email, isFirstTime: false, profile: null })
//         setUserType('client')
//         setSession(true)
//       }
//     })

//     // Check for existing client admin session
//     const savedUser = localStorage.getItem('currentClientAdmin')
//     if (savedUser) {
//       const user = JSON.parse(savedUser)
//       const profile = localStorage.getItem(`profile_${user.email}`)
//       if (profile) {
//         const profileData = JSON.parse(profile)
//         setClientAdminData({ email: user.email, profile: profileData, isFirstTime: false })
//         setUserType('client')
//         setSession(true)
//       }
//     }

//     // Listen for auth changes (email link clicks)
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_IN' && session) {
//         setSession(false)
//       }
//     })

//     return () => {
//       unsubscribe()
//       subscription.unsubscribe()
//     }
//   }, [])

//   const renderContent = () => {
//     switch (activeTab) {
//       case "Users":
//         return <SurveyPersonnel profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
//       case "Questions":
//         return <Surveys profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
//       case "surveys":
//         return <CreateSurvey profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
//       case "assignuser":
//         return <AssignUser profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
//       default:
//         return <SurveyPersonnel profile={clientAdminData?.profile} onProfileEdit={handleProfileEdit} onLogout={handleLogout} onNavigateToSurveys={handleNavigateToSurveys} />;
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {!session ? (
//         <Login onLogin={(type, data) => {
//           setUserType(type)
//           if (type === 'client') {
//             setClientAdminData(data)
//             localStorage.setItem('currentClientAdmin', JSON.stringify({ email: data.email }))
//           }
//           setSession(true)
//         }} />
//       ) : userType === 'superadmin' ? (
//         <SuperAdminDashboard />
//       ) : clientAdminData?.isFirstTime || showProfileEdit ? (
//         <ProfileSetup
//           email={clientAdminData.email}
//           onComplete={handleProfileComplete}
//           isEdit={showProfileEdit}
//           existingProfile={clientAdminData?.profile}
//         />
//       ) : (
//         <>
//           <TopBar setActiveTab={setActiveTab} onLogout={handleLogout} />
//           <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSidebarToggle={setSidebarOpen} />
//           <main className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
//             sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
//           }`}>
//             {renderContent()}
//           </main>
//         </>
//       )}
//     </div>
//   )
// }

// export default App

import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Pages/SideBar/Sidebar";
import TopBar from "./components/Pages/TapBar/TopBar";
import SurveyPersonnel from "./components/Pages/Client/CreateUsersAPI";
import Surveys from "./components/Pages/Client/CreateQuestionAPI";
import CreateSurvey from "./components/Pages/Client/CreateSurveysAPI";
import Login from "./components/Pages/LoginPage/Login";
import { supabase } from "./lib/supabaseClient";
import AssignUser from "./components/Pages/Client/AssignUser";
import SuperAdminDashboard from "./components/Pages/SuperAdmin/SuperAdminDashboardAPI";
import ProfileSetup from "./components/Pages/Client/ProfileSetup";
import ClientAdminHeader from "./components/Pages/Client/ClientAdminHeader";
import SetPassword from "./components/Pages/EmailPasswordSet/SetPassword";
import SurveyResults from "./components/Pages/Client/clientSurveyResult";
import { auth } from "./firebase";

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("personnel");
  const [session, setSession] = useState(() => {
    return localStorage.getItem("currentSuperAdmin") || localStorage.getItem("currentClientAdmin") || localStorage.getItem("currentUser") ? true : false;
  });
  const [userType, setUserType] = useState(() => {
    if (localStorage.getItem("currentSuperAdmin")) return "superadmin";
    if (localStorage.getItem("currentClientAdmin")) return "client";
    if (localStorage.getItem("currentUser")) return "user";
    return null;
  });
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clientAdminData, setClientAdminData] = useState(() => {
    const savedUser = localStorage.getItem("currentClientAdmin");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const profile = localStorage.getItem(`profile_${user.email}`);
      if (profile) {
        const profileData = JSON.parse(profile);
        return {
          email: user.email,
          profile: profileData,
          isFirstTime: false,
        };
      }
    }
    return null;
  });
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Check if we're on a password setup page
  const isPasswordSetupPage = location.pathname === "/set-password";

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setSession(false);
    setUserType(null);
    setActiveTab("personnel");
    setClientAdminData(null);
    setShowProfileEdit(false);
    localStorage.removeItem("currentClientAdmin");
    localStorage.removeItem("currentSuperAdmin");
    localStorage.removeItem("currentUser");
  };

  const handleProfileComplete = (profileData) => {
    setClientAdminData({
      ...clientAdminData,
      profile: profileData,
      isFirstTime: false,
    });
    setShowProfileEdit(false);
  };

  const handleProfileEdit = () => {
    setShowProfileEdit(true);
  };

  const handleCreateSurvey = () => {
    setActiveTab("surveys");
  };

  const handleNavigateToSurveys = () => {
    setActiveTab("surveys");
  };

  useEffect(() => {
    // Skip auth checks if we're on password setup pages
    if (isPasswordSetupPage) {
      return;
    }

    // Check if coming from email link (including hash parameters)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAccessToken = hashParams.has("access_token");

    if (hasAccessToken) {
      setSession(false);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for existing SuperAdmin session
    const savedSuperAdmin = localStorage.getItem("currentSuperAdmin");
    if (savedSuperAdmin) {
      setUserType("superadmin");
      setSession(true);
    }

    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Auth state changed:", user.email);

        // Check if it's superadmin by email
        if (user.email === "superadmin@vsurvey.com") {
          console.log("SuperAdmin detected, staying on SuperAdmin dashboard");
          localStorage.setItem("currentSuperAdmin", JSON.stringify({ email: user.email }));
          setUserType("superadmin");
          setSession(true);
          return;
        }

        // Skip navigation if we're in the middle of creating a user
        if (window.isCreatingUser) {
          console.log("User creation in progress, skipping navigation and activation");
          return;
        }
        
        // Skip activation for newly created users - they should remain pending
        if (window.justCreatedUser === user.email) {
          console.log("Newly created user detected, skipping auto-activation:", user.email);
          return;
        }

        console.log("Client user detected, checking profile setup");
        // Check if profile exists
        const existingProfile = localStorage.getItem(`profile_${user.email}`);
        if (existingProfile) {
          const profileData = JSON.parse(existingProfile);
          setClientAdminData({
            email: user.email,
            isFirstTime: false,
            profile: profileData,
          });
        } else {
          // First time login - show profile setup
          setClientAdminData({
            email: user.email,
            isFirstTime: true,
            profile: null,
          });
        }
        setUserType("client");
        setSession(true);
      } else if (!session) {
        // Only clear if no existing session
        setSession(false);
        setUserType(null);
        setClientAdminData(null);
      }
    });



    // Listen for auth changes (email link clicks)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSession(false);
      }
    });

    return () => {
      unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return (
          <SurveyPersonnel
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
            onNavigateToSurveys={handleNavigateToSurveys}
          />
        );
      case "Questions":
        return (
          <Surveys
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
            onNavigateToSurveys={handleNavigateToSurveys}
          />
        );
      case "surveys":
        return (
          <CreateSurvey
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
          />
        );
      case "assignuser":
        return (
          <AssignUser
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
            onNavigateToSurveys={handleNavigateToSurveys}
          />
        );
      case "results":
        return (
          <SurveyResults
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <SurveyPersonnel
            profile={clientAdminData?.profile}
            onProfileEdit={handleProfileEdit}
            onLogout={handleLogout}
            onNavigateToSurveys={handleNavigateToSurveys}
          />
        );
    }
  };

  // If we're on password setup page, render it directly
  if (isPasswordSetupPage) {
    return (
      <Routes>
        <Route path="/set-password" element={
          <SetPassword onPasswordSet={(type) => {
            if (type === 'superadmin') {
              localStorage.setItem("currentSuperAdmin", JSON.stringify({ email: 'superadmin@vsurvey.com' }));
              setUserType('superadmin');
            } else if (type === 'client') {
              setUserType('client');
            } else if (type === 'user') {
              setUserType('user');
            }
            setSession(true);
            window.location.href = '/';
          }} />
        } />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/set-password-admin"
          element={
            <SetPassword onPasswordSet={(type) => {
              if (type === 'superadmin') {
                localStorage.setItem("currentSuperAdmin", JSON.stringify({ email: 'superadmin@vsurvey.com' }));
                setUserType('superadmin');
              } else if (type === 'client') {
                setUserType('client');
              } else if (type === 'user') {
                setUserType('user');
              }
              setSession(true);
              window.location.href = '/';
            }} />
          }
        />
        <Route
          path="/*"
          element={
            !session ? (
              <Login
                onLogin={(type, data) => {
                  setUserType(type);
                  if (type === "client") {
                    // Check if profile exists for first-time detection
                    const existingProfile = localStorage.getItem(`profile_${data.email}`);
                    const clientData = {
                      ...data,
                      isFirstTime: !existingProfile,
                      profile: existingProfile ? JSON.parse(existingProfile) : null
                    };
                    setClientAdminData(clientData);
                    localStorage.setItem(
                      "currentClientAdmin",
                      JSON.stringify({ email: data.email })
                    );
                  } else if (type === "user") {
                    setUserData(data);
                    localStorage.setItem(
                      "currentUser",
                      JSON.stringify({ email: data.email })
                    );
                  }
                  setSession(true);
                }}
              />
            ) : userType === "superadmin" ? (
              <SuperAdminDashboard />
            ) : userType === "user" ? (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {userData?.email}!</h1>
                  <p className="text-gray-600 mb-8">Your account has been activated successfully.</p>
                  <p className="text-sm text-gray-500">Survey interface coming soon...</p>
                  <button 
                    onClick={handleLogout}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : clientAdminData?.isFirstTime || showProfileEdit ? (
              <ProfileSetup
                email={clientAdminData.email}
                onComplete={handleProfileComplete}
                isEdit={showProfileEdit}
                existingProfile={clientAdminData?.profile}
                setActiveTab={setActiveTab}
              />
            ) : (
              <>
                <TopBar
                  setActiveTab={setActiveTab}
                  onLogout={handleLogout}
                  onProfileEdit={handleProfileEdit}
                  isMobileMenuOpen={isMobileMenuOpen}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                  profile={clientAdminData?.profile}
                />
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onSidebarToggle={setSidebarOpen}
                  isMobileOpen={isMobileMenuOpen}
                  setIsMobileOpen={setIsMobileMenuOpen}
                />
                <main
                  className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
                    sidebarOpen ? "xl:ml-64" : "xl:ml-16"
                  }`}
                >
                  {renderContent()}
                </main>
              </>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;