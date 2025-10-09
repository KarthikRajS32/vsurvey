// import { useState, useEffect } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Plus, Users, Building, Trash2, Edit3, UserCheck, UserX, Mail, UserPlus } from "lucide-react"
// import TopBar from "../TapBar/TopBar"
// import SuperAdminSidebar from "../SideBar/SuperAdminSidebar"
// import { db, auth } from '../../../firebase'
// import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
// import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
// import { initializeApp } from 'firebase/app'
// import { getAuth } from 'firebase/auth'

// // Create separate Firebase app for user creation (doesn't affect main auth state)
// const secondaryApp = initializeApp({
//   apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
//   authDomain: "vsurvey-68195.firebaseapp.com",
//   projectId: "vsurvey-68195",
//   storageBucket: "vsurvey-68195.firebasestorage.app",
//   messagingSenderId: "669564501775",
//   appId: "1:669564501775:web:0f69ced66244252014887a"
// }, "secondary")

// const secondaryAuth = getAuth(secondaryApp)

// const SuperAdminDashboardAPI = () => {
//   const [activeTab, setActiveTab] = useState('clients')
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [clientAdmins, setClientAdmins] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [isCreatingUser, setIsCreatingUser] = useState(false) // Add this flag
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     clientId: ''
//   })
//   const [message, setMessage] = useState('')

//   // Load clients from Firebase
//   useEffect(() => {
//     loadClients()
//   }, [])

//   const loadClients = async () => {
//     try {
//       setLoading(true)
//       // Get clients from Firebase structure: superadmin/U0UjGVvDJoDbLtWAhyjp/clients
//       const superadminId = "U0UjGVvDJoDbLtWAhyjp"
//       const clientsRef = collection(db, "superadmin", superadminId, "clients")
//       const snapshot = await getDocs(clientsRef)

//       const clients = []
//       snapshot.forEach((doc) => {
//         const data = doc.data()
//         clients.push({
//           id: doc.id,
//           name: data.name || `Client ${doc.id.substring(0, 8)}`, // Default name if missing
//           email: data.email || 'No email provided',
//           clientId: data.clientId || doc.id,
//           createdAt: data.createdAt || new Date().toISOString(),
//           isActive: data.isActive !== undefined ? data.isActive : true,
//           ...data
//         })
//       })

//       console.log('Loaded clients:', clients) // Debug log
//       setClientAdmins(clients)
//     } catch (error) {
//       console.error('Error loading clients:', error)
//       setMessage('Failed to load clients')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.name.trim() || !formData.email.trim()) {
//       setMessage('Please fill in all required fields')
//       return
//     }

//     try {
//       setLoading(true)
//       setIsCreatingUser(true) // Set flag to prevent navigation
//       window.isCreatingUser = true // Set global flag

//       console.log('Creating Firebase user for:', formData.email.trim())

//       // Create Firebase user with temporary password using secondary auth
//       const tempPassword = `Temp${Date.now()}!` // Temporary password
//       const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email.trim(), tempPassword)
//       console.log('Firebase user created successfully:', userCredential.user.uid)

//       // Send password reset email immediately using secondary auth
//       console.log('Sending password reset email...')
//       await sendPasswordResetEmail(secondaryAuth, formData.email.trim())
//       console.log('Password reset email sent successfully')

//       // Create client document
//       const superadminId = "U0UjGVvDJoDbLtWAhyjp"
//       const clientsRef = collection(db, "superadmin", superadminId, "clients")

//       const newClient = {
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         clientId: formData.clientId.trim() || `client_${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         isActive: true,
//         firebaseUid: userCredential.user.uid
//       }

//       await addDoc(clientsRef, newClient)
//       console.log('Client document created successfully')

//       setFormData({ name: '', email: '', clientId: '' })
//       setMessage(`✅ Client created successfully! Password setup email sent to ${formData.email} (Check spam folder if not received)`)
//       setTimeout(() => setMessage(''), 10000)

//       // Reload clients
//       loadClients()
//     } catch (error) {
//       console.error('Detailed error creating client:', error)
//       console.error('Error code:', error.code)
//       console.error('Error message:', error.message)

//       if (error.code === 'auth/email-already-in-use') {
//         setMessage('❌ Email already exists in Firebase Auth')
//       } else if (error.code === 'auth/weak-password') {
//         setMessage('❌ Password is too weak')
//       } else if (error.code === 'auth/invalid-email') {
//         setMessage('❌ Invalid email address')
//       } else {
//         setMessage('❌ Failed to create client: ' + error.message)
//       }
//       setTimeout(() => setMessage(''), 8000)
//     } finally {
//       setLoading(false)
//       setIsCreatingUser(false) // Clear flag
//       window.isCreatingUser = false // Clear global flag
//     }
//   }

//   const handleDelete = async (clientId) => {
//     if (window.confirm('Are you sure you want to delete this client admin?')) {
//       try {
//         const superadminId = "U0UjGVvDJoDbLtWAhyjp"
//         await deleteDoc(doc(db, "superadmin", superadminId, "clients", clientId))
//         setMessage('Client admin deleted successfully!')
//         setTimeout(() => setMessage(''), 3000)
//         loadClients()
//       } catch (error) {
//         console.error('Error deleting client:', error)
//         setMessage('Failed to delete client admin')
//       }
//     }
//   }

//   const createFirebaseUser = async (email) => {
//     try {
//       console.log('Creating Firebase user for:', email)
//       // Create user with temporary password
//       const tempPassword = `Temp${Date.now()}!`
//       const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
//       console.log('Firebase user created:', userCredential.user.uid)

//       // Re-authenticate as SuperAdmin to maintain session
//       await signInWithEmailAndPassword(auth, 'superadmin@vsurvey.com', 'superadmin123')
//       console.log('Re-authenticated as SuperAdmin')

//       // Send password reset email immediately
//       await sendPasswordResetEmail(auth, email)
//       console.log('Password reset email sent')

//       setMessage(`✅ Firebase user created and password setup email sent to ${email}`)
//       setTimeout(() => setMessage(''), 8000)
//     } catch (error) {
//       console.error('Error creating Firebase user:', error)
//       if (error.code === 'auth/email-already-in-use') {
//         // User exists, just send reset email
//         await resendPasswordEmail(email)
//       } else {
//         setMessage(`❌ Failed to create user: ${error.message}`)
//         setTimeout(() => setMessage(''), 8000)
//       }
//     }
//   }

//   const resendPasswordEmail = async (email) => {
//     try {
//       console.log('Attempting to send password reset email to:', email)
//       await sendPasswordResetEmail(auth, email)
//       console.log('Password reset email sent successfully')
//       setMessage(`✅ Password setup email sent to ${email}`)
//       setTimeout(() => setMessage(''), 5000)
//     } catch (error) {
//       console.error('Error sending password reset email:', error)
//       console.error('Error code:', error.code)
//       console.error('Error message:', error.message)

//       if (error.code === 'auth/user-not-found') {
//         setMessage(`❌ User ${email} not found in Firebase Auth. Please create the user first.`)
//       } else if (error.code === 'auth/invalid-email') {
//         setMessage(`❌ Invalid email address: ${email}`)
//       } else {
//         setMessage(`❌ Failed to send email: ${error.message}`)
//       }
//       setTimeout(() => setMessage(''), 8000)
//     }
//   }

//   const toggleClientStatus = async (clientId, currentStatus) => {
//     try {
//       const superadminId = "U0UjGVvDJoDbLtWAhyjp"
//       await updateDoc(doc(db, "superadmin", superadminId, "clients", clientId), {
//         isActive: !currentStatus
//       })
//       setMessage('Client status updated successfully!')
//       setTimeout(() => setMessage(''), 3000)
//       loadClients()
//     } catch (error) {
//       console.error('Error updating client status:', error)
//       setMessage('Failed to update client status')
//     }
//   }

//   const handleLogout = () => {
//     // Handle logout logic
//     window.location.reload()
//   }

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'clients':
//         return (
//           <>
//             <div className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
//               <p className="text-gray-600">Create and manage client administrators</p>
//             </div>

//             {message && (
//               <div className={`mb-6 p-4 rounded-md ${
//                 message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//               }`}>
//                 {message}
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Create Client Admin Form */}
//               <Card className="lg:col-span-1">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Plus className="w-5 h-5" />
//                     Add Client Admin
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                       <Label htmlFor="name">Company Name *</Label>
//                       <Input
//                         id="name"
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({...formData, name: e.target.value})}
//                         placeholder="Enter company name"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="email">Admin Email *</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => setFormData({...formData, email: e.target.value})}
//                         placeholder="Enter admin email"
//                         required
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Password setup email will be sent automatically
//                       </p>
//                     </div>

//                     <div>
//                       <Label htmlFor="clientId">Client ID (Optional)</Label>
//                       <Input
//                         id="clientId"
//                         type="text"
//                         value={formData.clientId}
//                         onChange={(e) => setFormData({...formData, clientId: e.target.value})}
//                         placeholder="Auto-generated if empty"
//                       />
//                     </div>

//                     <Button type="submit" disabled={loading} className="w-full">
//                       {loading ? 'Creating...' : 'Create Client Admin'}
//                     </Button>
//                   </form>
//                 </CardContent>
//               </Card>

//               {/* Client Admins List */}
//               <Card className="lg:col-span-2">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Users className="w-5 h-5" />
//                     Client Administrators ({clientAdmins.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {loading && <p>Loading clients...</p>}

//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {clientAdmins.map((admin) => (
//                       <div key={admin.id} className="border rounded-lg p-4 bg-white">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-2">
//                               <Building className="w-4 h-4 text-gray-500" />
//                               <h3 className="font-semibold">{admin.name}</h3>
//                               <span className={`px-2 py-1 text-xs rounded-full ${
//                                 admin.isActive
//                                   ? 'bg-green-100 text-green-800'
//                                   : 'bg-red-100 text-red-800'
//                               }`}>
//                                 {admin.isActive ? 'Active' : 'Inactive'}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-600 mb-1">Email: {admin.email}</p>
//                             <p className="text-sm text-gray-600 mb-1">Client ID: {admin.clientId || admin.id}</p>
//                             <p className="text-sm text-gray-500">
//                               Created: {new Date(admin.createdAt).toLocaleDateString()}
//                             </p>
//                           </div>

//                           <div className="flex gap-2 ml-4">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => createFirebaseUser(admin.email)}
//                               title="Create Firebase user & send password email"
//                             >
//                               <UserPlus className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => resendPasswordEmail(admin.email)}
//                               title="Resend password setup email"
//                             >
//                               <Mail className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => toggleClientStatus(admin.id, admin.isActive)}
//                             >
//                               {admin.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDelete(admin.id)}
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}

//                     {clientAdmins.length === 0 && !loading && (
//                       <p className="text-gray-500 text-center py-8">No client administrators found</p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Total Clients</p>
//                       <p className="text-2xl font-bold">{clientAdmins.length}</p>
//                     </div>
//                     <Building className="w-8 h-8 text-blue-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Active Clients</p>
//                       <p className="text-2xl font-bold">{clientAdmins.filter(c => c.isActive).length}</p>
//                     </div>
//                     <UserCheck className="w-8 h-8 text-green-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Inactive Clients</p>
//                       <p className="text-2xl font-bold">{clientAdmins.filter(c => !c.isActive).length}</p>
//                     </div>
//                     <UserX className="w-8 h-8 text-red-500" />
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </>
//         )
//       case 'results':
//         return (
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Results</h1>
//             <p className="text-gray-600">View and analyze survey responses from all clients</p>
//             <div className="mt-8 p-8 bg-gray-100 rounded-lg text-center">
//               <p className="text-gray-500">Survey results feature coming soon...</p>
//             </div>
//           </div>
//         )
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <TopBar setActiveTab={setActiveTab} onLogout={handleLogout} />
//       <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onSidebarToggle={setSidebarOpen} />

//       <main className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
//         sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
//       }`}>
//         <div className="max-w-7xl mx-auto">
//           {renderContent()}
//         </div>
//       </main>
//     </div>
//   )
// }

// export default SuperAdminDashboardAPI

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Users,
  Building,
  Trash2,
  Edit3,
  UserCheck,
  UserX,
  Mail,
  UserPlus,
} from "lucide-react";
import TopBar from "../TapBar/TopBar";
import SuperAdminSidebar from "../SideBar/SuperAdminSidebar";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { setSuperAdminUpdateCallback } from "../../../services/superAdminNotification";

// Create separate Firebase app for user creation (doesn't affect main auth state)
const secondaryApp = initializeApp(
  {
    apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
    authDomain: "vsurvey-68195.firebaseapp.com",
    projectId: "vsurvey-68195",
    storageBucket: "vsurvey-68195.firebasestorage.app",
    messagingSenderId: "669564501775",
    appId: "1:669564501775:web:0f69ced66244252014887a",
  },
  "secondary"
);

const secondaryAuth = getAuth(secondaryApp);

const SuperAdminDashboardAPI = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clientAdmins, setClientAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false); // Add this flag
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clientId: "",
  });
  const [message, setMessage] = useState("");

  // Load clients from Firebase with real-time listener for status changes only
  useEffect(() => {
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    
    // Set up real-time listener only for status field changes
    const unsubscribe = onSnapshot(clientsRef, (snapshot) => {
      const clients = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({
          id: doc.id,
          name: data.name || `Client ${doc.id.substring(0, 8)}`,
          email: data.email || "No email provided",
          clientId: data.clientId || doc.id,
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || "pending",
          isActive: data.isActive !== undefined ? data.isActive : false,
          ...data,
        });
      });
      
      // Only update if there are actual changes
      setClientAdmins(prevClients => {
        const hasChanges = JSON.stringify(prevClients) !== JSON.stringify(clients);
        if (hasChanges) {
          console.log("Client status updated:", clients.filter(c => c.status === "active").map(c => c.email));
          return clients;
        }
        return prevClients;
      });
    });
    
    return () => unsubscribe();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // Get clients from Firebase structure: superadmin/U0UjGVvDJoDbLtWAhyjp/clients
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      const clientsRef = collection(db, "superadmin", superadminId, "clients");
      const snapshot = await getDocs(clientsRef);

      const clients = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({
          id: doc.id,
          name: data.name || `Client ${doc.id.substring(0, 8)}`, // Default name if missing
          email: data.email || "No email provided",
          clientId: data.clientId || doc.id,
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || "pending",
          isActive: data.isActive !== undefined ? data.isActive : false,
          ...data,
        });
      });

      console.log("Loaded clients:", clients); // Debug log
      setClientAdmins(clients);
      
      // Check if any client status changed from pending to active
      const activeClients = clients.filter(c => c.status === "active");
      if (activeClients.length > 0) {
        console.log("Active clients detected:", activeClients.map(c => c.email));
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setMessage("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setIsCreatingUser(true); // Set flag to prevent navigation
      window.isCreatingUser = true; // Set global flag

      console.log("Creating Firebase user for:", formData.email.trim());

      // Create Firebase user with temporary password using secondary auth
      const tempPassword = `Temp${Date.now()}!`; // Temporary password
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email.trim(),
        tempPassword
      );
      console.log(
        "Firebase user created successfully:",
        userCredential.user.uid
      );

      // Send password reset email immediately using secondary auth
      console.log("Sending password reset email...");
      await sendPasswordResetEmail(secondaryAuth, formData.email.trim());
      console.log("Password reset email sent successfully");

      // Create client document
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      const clientsRef = collection(db, "superadmin", superadminId, "clients");

      const newClient = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        clientId: formData.clientId.trim() || `client_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "pending",
        isActive: false,
        firebaseUid: userCredential.user.uid,
      };

      await addDoc(clientsRef, newClient);
      console.log("Client document created successfully");

      setFormData({ name: "", email: "", clientId: "" });
      setMessage(
        `✅ Client created successfully! Password setup email sent to ${formData.email} (Check spam folder if not received)`
      );
      setTimeout(() => setMessage(""), 10000);

      // Reload clients
      loadClients();
    } catch (error) {
      console.error("Detailed error creating client:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      if (error.code === "auth/email-already-in-use") {
        setMessage("❌ Email already exists in Firebase Auth");
      } else if (error.code === "auth/weak-password") {
        setMessage("❌ Password is too weak");
      } else if (error.code === "auth/invalid-email") {
        setMessage("❌ Invalid email address");
      } else {
        setMessage("❌ Failed to create client: " + error.message);
      }
      setTimeout(() => setMessage(""), 8000);
    } finally {
      setLoading(false);
      setIsCreatingUser(false); // Clear flag
      window.isCreatingUser = false; // Clear global flag
    }
  };

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client admin?")) {
      try {
        const superadminId = "U0UjGVvDJoDbLtWAhyjp";
        await deleteDoc(
          doc(db, "superadmin", superadminId, "clients", clientId)
        );
        setMessage("Client admin deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
        loadClients();
      } catch (error) {
        console.error("Error deleting client:", error);
        setMessage("Failed to delete client admin");
      }
    }
  };

  const createFirebaseUser = async (email) => {
    try {
      console.log("Creating Firebase user for:", email);
      // Create user with temporary password
      const tempPassword = `Temp${Date.now()}!`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        tempPassword
      );
      console.log("Firebase user created:", userCredential.user.uid);

      // Re-authenticate as SuperAdmin to maintain session
      await signInWithEmailAndPassword(
        auth,
        "superadmin@vsurvey.com",
        "superadmin123"
      );
      console.log("Re-authenticated as SuperAdmin");

      // Send password reset email immediately
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");

      setMessage(
        `✅ Firebase user created and password setup email sent to ${email}`
      );
      setTimeout(() => setMessage(""), 8000);
    } catch (error) {
      console.error("Error creating Firebase user:", error);
      if (error.code === "auth/email-already-in-use") {
        // User exists, just send reset email
        await resendPasswordEmail(email);
      } else {
        setMessage(`❌ Failed to create user: ${error.message}`);
        setTimeout(() => setMessage(""), 8000);
      }
    }
  };

  const resendPasswordEmail = async (email) => {
    try {
      console.log("Attempting to send password reset email to:", email);
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully");
      setMessage(`✅ Password setup email sent to ${email}`);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      if (error.code === "auth/user-not-found") {
        setMessage(
          `❌ User ${email} not found in Firebase Auth. Please create the user first.`
        );
      } else if (error.code === "auth/invalid-email") {
        setMessage(`❌ Invalid email address: ${email}`);
      } else {
        setMessage(`❌ Failed to send email: ${error.message}`);
      }
      setTimeout(() => setMessage(""), 8000);
    }
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    try {
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      await updateDoc(
        doc(db, "superadmin", superadminId, "clients", clientId),
        {
          isActive: !currentStatus,
        }
      );
      setMessage("Client status updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      loadClients();
    } catch (error) {
      console.error("Error updating client status:", error);
      setMessage("Failed to update client status");
    }
  };

  const handleLogout = () => {
    // Handle logout logic
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Client Management
              </h1>
              <p className="text-gray-600">
                Create and manage client administrators
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Client Admin Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Client Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Admin Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter admin email"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password setup email will be sent automatically
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="clientId">Client ID (Optional)</Label>
                      <Input
                        id="clientId"
                        type="text"
                        value={formData.clientId}
                        onChange={(e) =>
                          setFormData({ ...formData, clientId: e.target.value })
                        }
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700">
                      {loading ? "Creating..." : "Create Client Admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Client Admins List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Client Administrators ({clientAdmins.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && <p>Loading clients...</p>}

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {clientAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-gray-500" />
                              <h3 className="font-semibold">{admin.name}</h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  admin.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : admin.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {admin.status === "active" ? "Active" : admin.status === "pending" ? "Pending" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Email: {admin.email}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              Client ID: {admin.clientId || admin.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created:{" "}
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => createFirebaseUser(admin.email)}
                              title="Create Firebase user & send password email"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendPasswordEmail(admin.email)}
                              title="Resend password setup email"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleClientStatus(admin.id, admin.isActive)
                              }
                            >
                              {admin.isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(admin.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {clientAdmins.length === 0 && !loading && (
                      <p className="text-gray-500 text-center py-8">
                        No client administrators found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Clients
                      </p>
                      <p className="text-2xl font-bold">
                        {clientAdmins.length}
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Clients
                      </p>
                      <p className="text-2xl font-bold">
                        {clientAdmins.filter((c) => c.status === "active").length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pending Clients
                      </p>
                      <p className="text-2xl font-bold">
                        {clientAdmins.filter((c) => c.status === "pending").length}
                      </p>
                    </div>
                    <Mail className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Inactive Clients
                      </p>
                      <p className="text-2xl font-bold">
                        {clientAdmins.filter((c) => c.status === "inactive").length}
                      </p>
                    </div>
                    <UserX className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
      case "results":
        return (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Survey Results
            </h1>
            <p className="text-gray-600">
              View and analyze survey responses from all clients
            </p>
            <div className="mt-8 p-8 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-500">
                Survey results feature coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isSuperAdmin={true}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <SuperAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSidebarToggle={(isOpen) => {
          setSidebarOpen(isOpen);
          setIsSidebarOpen(isOpen);
        }}
      />

      <main
        className={`transition-all duration-300 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default SuperAdminDashboardAPI;