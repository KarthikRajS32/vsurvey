// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Edit3, Trash2, Search, Plus, UserCheck, UserX } from "lucide-react"
// import ClientAdminHeader from "./ClientAdminHeader"
// import { useUsers } from "../../../hooks/useApi"
// import authService from "../../../services/authService"

// const CreateUsersAPI = ({ profile, onProfileEdit, onLogout, onNavigateToSurveys }) => {
//   const {
//     users,
//     pagination,
//     loading,
//     error,
//     setError,
//     fetchUsers,
//     createUser,
//     updateUser,
//     deleteUser,
//     toggleUserStatus
//   } = useUsers();

//   const [formData, setFormData] = useState({
//     full_name: '',
//     email: ''
//   })
//   const [message, setMessage] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize] = useState(10)
  
//   // Edit modal states
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [editingUser, setEditingUser] = useState(null)
//   const [editFormData, setEditFormData] = useState({
//     full_name: '',
//     email: ''
//   })
  
//   // Delete confirmation modal states
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
//   const [userToDelete, setUserToDelete] = useState(null)

//   // Load users on component mount and when page/search changes
//   useEffect(() => {
//     const loadUsersWhenReady = async () => {
//       // Wait for Firebase auth to be ready
//       let attempts = 0;
//       const maxAttempts = 10;
      
//       while (!authService.isAuthenticated() && attempts < maxAttempts) {
//         await new Promise(resolve => setTimeout(resolve, 500));
//         attempts++;
//       }
      
//       if (authService.isAuthenticated()) {
//         loadUsers();
//       }
//     };
    
//     loadUsersWhenReady();
//   }, [currentPage, searchTerm]);

//   const loadUsers = async () => {
//     try {
//       await fetchUsers({
//         page: currentPage,
//         size: pageSize,
//         ...(searchTerm && { search: searchTerm })
//       });
//     } catch (err) {
//       console.error('Failed to load users:', err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault()
    
//     if (!formData.full_name.trim() || !formData.email.trim()) {
//       setMessage('Please fill in all required fields')
//       return
//     }

//     // Debug auth state
//     console.log('Auth state:', authService.isAuthenticated())
//     console.log('Current user:', authService.getCurrentUser())

//     try {
//       await createUser({
//         full_name: formData.full_name.trim(),
//         email: formData.email.trim(),
//         created_by: profile?.email || 'admin@example.com'
//       });
      
//       setFormData({ full_name: '', email: '' })
//       setMessage('User created successfully!')
//       setTimeout(() => setMessage(''), 3000)
//       // Note: User list refresh disabled due to backend issue
//     } catch (err) {
//       console.error('Create user error:', err)
//       setMessage(err.message || 'Failed to create user')
//       setTimeout(() => setMessage(''), 5000)
//     }
//   }

//   const handleToggleStatus = async (userId) => {
//     try {
//       await toggleUserStatus(userId);
//       setMessage('User status updated successfully!')
//       setTimeout(() => setMessage(''), 3000)
//     } catch (err) {
//       setMessage(err.message || 'Failed to update user status')
//       setTimeout(() => setMessage(''), 5000)
//     }
//   }

//   const openDeleteModal = (user) => {
//     setUserToDelete(user)
//     setIsDeleteModalOpen(true)
//   }

//   const confirmDelete = async () => {
//     if (userToDelete) {
//       try {
//         await deleteUser(userToDelete.id);
//         setMessage('User deleted successfully!')
//         setTimeout(() => setMessage(''), 3000)
//       } catch (err) {
//         setMessage(err.message || 'Failed to delete user')
//         setTimeout(() => setMessage(''), 5000)
//       }
//     }
//     setIsDeleteModalOpen(false)
//     setUserToDelete(null)
//   }

//   const cancelDelete = () => {
//     setIsDeleteModalOpen(false)
//     setUserToDelete(null)
//   }

//   const openEditModal = (user) => {
//     setEditingUser(user)
//     setEditFormData({
//       full_name: user.full_name,
//       email: user.email
//     })
//     setIsEditModalOpen(true)
//   }

//   const handleEditSubmit = async (e) => {
//     e.preventDefault()
    
//     if (!editFormData.full_name.trim() || !editFormData.email.trim()) {
//       return
//     }

//     try {
//       await updateUser(editingUser.id, {
//         full_name: editFormData.full_name.trim(),
//         email: editFormData.email.trim()
//       });
      
//       setIsEditModalOpen(false)
//       setEditingUser(null)
//       setMessage('User updated successfully!')
//       setTimeout(() => setMessage(''), 3000)
//     } catch (err) {
//       setMessage(err.message || 'Failed to update user')
//       setTimeout(() => setMessage(''), 5000)
//     }
//   }

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value)
//     setCurrentPage(1) // Reset to first page when searching
//   }

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage)
//   }

//   const clearError = () => {
//     setError(null)
//     setMessage('')
//   }

//   return (
//     <div className="space-y-6">
//       <ClientAdminHeader 
//         profile={profile} 
//         onProfileEdit={onProfileEdit} 
//         onLogout={onLogout} 
//       />
      
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Survey Users</h1>
//           <p className="text-gray-600 mt-1">Manage users who can participate in surveys</p>
//         </div>
//         <Button 
//           onClick={onNavigateToSurveys}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           Create Survey
//         </Button>
//       </div>

//       {/* Display messages */}
//       {(message || error) && (
//         <div className={`p-4 rounded-lg ${
//           error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
//         }`}>
//           <div className="flex justify-between items-center">
//             <span>{error || message}</span>
//             <button onClick={clearError} className="text-sm underline">Dismiss</button>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Create User Form */}
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Plus className="w-5 h-5" />
//               Add New User
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name *
//                 </label>
//                 <Input
//                   type="text"
//                   value={formData.full_name}
//                   onChange={(e) => setFormData({...formData, full_name: e.target.value})}
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address *
//                 </label>
//                 <Input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   placeholder="Enter email address"
//                   required
//                 />
//               </div>
              
//               <Button 
//                 type="submit" 
//                 className="w-full bg-blue-600 hover:bg-blue-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Creating...' : 'Create User'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Users List */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <CardTitle>Users ({pagination.total})</CardTitle>
//               <div className="relative w-full sm:w-64">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   type="text"
//                   placeholder="Search users..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {loading && users.length === 0 ? (
//               <div className="text-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="text-gray-500 mt-2">Loading users...</p>
//               </div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">No users found</p>
//                 {searchTerm && (
//                   <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((user) => (
//                   <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                         <div>
//                           <h3 className="font-medium text-gray-900">{user.full_name}</h3>
//                           <p className="text-sm text-gray-500">{user.email}</p>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleToggleStatus(user.id)}
//                         className={`${user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
//                         disabled={loading}
//                       >
//                         {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
//                       </Button>
                      
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => openEditModal(user)}
//                         className="text-blue-600 hover:text-blue-700"
//                       >
//                         <Edit3 className="w-4 h-4" />
//                       </Button>
                      
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => openDeleteModal(user)}
//                         className="text-red-600 hover:text-red-700"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-6">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1 || loading}
//                 >
//                   Previous
//                 </Button>
                
//                 <span className="text-sm text-gray-600">
//                   Page {currentPage} of {pagination.pages}
//                 </span>
                
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === pagination.pages || loading}
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Edit User Modal */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit User</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleEditSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name *
//               </label>
//               <Input
//                 type="text"
//                 value={editFormData.full_name}
//                 onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
//                 placeholder="Enter full name"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address *
//               </label>
//               <Input
//                 type="email"
//                 value={editFormData.email}
//                 onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
//                 placeholder="Enter email address"
//                 required
//               />
//             </div>
            
//             <div className="flex gap-2 pt-4">
//               <Button 
//                 type="submit" 
//                 className="flex-1 bg-blue-600 hover:bg-blue-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Updating...' : 'Update User'}
//               </Button>
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Modal */}
//       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Delete</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <p>Are you sure you want to delete <strong>{userToDelete?.full_name}</strong>?</p>
//             <p className="text-sm text-gray-600">This action cannot be undone.</p>
            
//             <div className="flex gap-2 pt-4">
//               <Button 
//                 onClick={confirmDelete}
//                 className="flex-1 bg-red-600 hover:bg-red-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Deleting...' : 'Delete User'}
//               </Button>
//               <Button 
//                 variant="outline" 
//                 onClick={cancelDelete}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// export default CreateUsersAPI















import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit3, Trash2, Search, Plus, UserCheck, UserX, Mail, UserPlus } from "lucide-react";
import { useUsers } from "../../../hooks/useApi";
import authService from "../../../services/authService";
import { auth } from "../../../firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Create separate Firebase app for user creation
const secondaryApp = initializeApp({
  apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
  authDomain: "vsurvey-68195.firebaseapp.com",
  projectId: "vsurvey-68195",
  storageBucket: "vsurvey-68195.firebasestorage.app",
  messagingSenderId: "669564501775",
  appId: "1:669564501775:web:0f69ced66244252014887a"
}, "secondary");

const secondaryAuth = getAuth(secondaryApp);

const CreateUsersAPI = ({
  profile,
  onProfileEdit,
  onLogout,
  onNavigateToSurveys,
}) => {
  const {
    users,
    pagination,
    loading,
    error,
    setError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUsers();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
  });

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Load users on component mount and when page/search changes
  useEffect(() => {
    const loadUsersWhenReady = async () => {
      // Wait for Firebase auth to be ready
      let attempts = 0;
      const maxAttempts = 10;

      while (!authService.isAuthenticated() && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      if (authService.isAuthenticated()) {
        loadUsers();
      }
    };

    loadUsersWhenReady();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      await fetchUsers({
        page: currentPage,
        size: pageSize,
        ...(searchTerm && { search: searchTerm }),
      });
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      // Create Firebase user with temporary password using secondary auth
      const tempPassword = `Temp${Date.now()}!`;
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email.trim(),
        tempPassword
      );
      console.log("Firebase user created successfully:", userCredential.user.uid);

      // Send password reset email immediately using secondary auth
      await sendPasswordResetEmail(secondaryAuth, formData.email.trim());
      console.log("Password reset email sent successfully");

      // Create user in backend
      await createUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        created_by: profile?.email || "admin@example.com",
        firebaseUid: userCredential.user.uid,
      });

      setFormData({ full_name: "", email: "" });
      setMessage(`✅ User created successfully! Password setup email sent to ${formData.email} (Check spam folder if not received)`);
      setTimeout(() => setMessage(""), 10000);
    } catch (err) {
      console.error("Create user error:", err);
      if (err.code === "auth/email-already-in-use") {
        setMessage("❌ Email already exists in Firebase Auth");
      } else if (err.code === "auth/weak-password") {
        setMessage("❌ Password is too weak");
      } else if (err.code === "auth/invalid-email") {
        setMessage("❌ Invalid email address");
      } else {
        setMessage(err.message || "Failed to create user");
      }
      setTimeout(() => setMessage(""), 8000);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      setMessage("User status updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to update user status");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setMessage("User deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setMessage(err.message || "Failed to delete user");
        setTimeout(() => setMessage(""), 5000);
      }
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.full_name.trim() || !editFormData.email.trim()) {
      return;
    }

    try {
      await updateUser(editingUser.id, {
        full_name: editFormData.full_name.trim(),
        email: editFormData.email.trim(),
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
      setMessage("User updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to update user");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const clearError = () => {
    setError(null);
    setMessage("");
  };

  const createFirebaseUser = async (email) => {
    try {
      console.log("Creating Firebase user for:", email);
      const tempPassword = `Temp${Date.now()}!`;
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        tempPassword
      );
      console.log("Firebase user created:", userCredential.user.uid);

      await sendPasswordResetEmail(secondaryAuth, email);
      console.log("Password reset email sent");

      setMessage(`✅ Firebase user created and password setup email sent to ${email}`);
      setTimeout(() => setMessage(""), 8000);
    } catch (error) {
      console.error("Error creating Firebase user:", error);
      if (error.code === "auth/email-already-in-use") {
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
      await sendPasswordResetEmail(secondaryAuth, email);
      console.log("Password reset email sent successfully");
      setMessage(`✅ Password setup email sent to ${email}`);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === "auth/user-not-found") {
        setMessage(`❌ User ${email} not found in Firebase Auth. Please create the user first.`);
      } else if (error.code === "auth/invalid-email") {
        setMessage(`❌ Invalid email address: ${email}`);
      } else {
        setMessage(`❌ Failed to send email: ${error.message}`);
      }
      setTimeout(() => setMessage(""), 8000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Survey Users
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users who can participate in surveys
          </p>
        </div>
        {/* <Button
          onClick={onNavigateToSurveys}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Survey
        </Button> */}
      </div>

      {/* Display messages */}
      {(message || error) && (
        <div
          className={`p-4 rounded-lg ${
            error
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{error || message}</span>
            <button onClick={clearError} className="text-sm underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password setup email will be sent automatically
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Users ({pagination.total})</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && users.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Status indicator */}
                    <div
                      className={`absolute top-3 right-3 w-3 h-3 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                    ></div>

                    {/* User info */}
                    <div className="pr-6 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                        {user.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status:{" "}
                        <span
                          className={`font-medium ${user.is_active ? "text-green-600" : "text-red-600"}`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          className={`text-xs px-2 py-1 h-7 ${user.is_active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`}
                          disabled={loading}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-7 w-7"
                            title="Edit user"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                            title="Delete user"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Firebase actions */}
                      <div className="flex items-center gap-1">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => createFirebaseUser(user.email)}
                          className="text-xs px-2 py-1 h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 flex-1"
                          title="Create Firebase user & send password email"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Create Auth
                        </Button> */}
                        
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendPasswordEmail(user.email)}
                          className="text-xs px-2 py-1 h-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex-1"
                          title="Resend password setup email"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Send Email
                        </Button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                value={editFormData.full_name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    full_name: e.target.value,
                  })
                }
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.full_name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete User"}
              </Button>
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateUsersAPI;
