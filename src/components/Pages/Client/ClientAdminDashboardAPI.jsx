// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Plus,
//   Users,
//   Trash2,
//   UserCheck,
//   UserX,
//   Mail,
//   UserPlus,
//   Building,
// } from "lucide-react";
// import ClientAdminHeader from "./ClientAdminHeader";
// import { db, auth } from "../../../firebase";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
//   updateDoc,
//   setDoc,
//   onSnapshot,
//   query,
//   where,
// } from "firebase/firestore";
// import {
//   createUserWithEmailAndPassword,
//   sendPasswordResetEmail,
// } from "firebase/auth";
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// // Create separate Firebase app for user creation
// const secondaryApp = initializeApp(
//   {
//     apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
//     authDomain: "vsurvey-68195.firebaseapp.com",
//     projectId: "vsurvey-68195",
//     storageBucket: "vsurvey-68195.firebasestorage.app",
//     messagingSenderId: "669564501775",
//     appId: "1:669564501775:web:0f69ced66244252014887a",
//   },
//   "secondary"
// );

// const secondaryAuth = getAuth(secondaryApp);

// const ClientAdminDashboardAPI = ({ profile, onProfileEdit, onLogout }) => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     full_name: "",
//     email: "",
//   });
//   const [message, setMessage] = useState("");

//   // Load users from Firebase with real-time listener
//   useEffect(() => {
//     const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
//       console.log("DEBUG: Auth state changed, current user:", currentUser?.email);
      
//       // Skip if we're creating a user to avoid auth state conflicts
//       if (window.isCreatingUser) {
//         console.log("DEBUG: Skipping user load during user creation");
//         return;
//       }
      
//       if (!currentUser?.email) {
//         console.log("DEBUG: No current user found, cannot load users");
//         setUsers([]);
//         return;
//       }

//       console.log("DEBUG: Loading users for client");
//       const clientId = profile?.clientId || profile?.id || "8v3Mmi2BJ60ehQ9Dhqo3";
//       const usersRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "users");

//       const unsubscribeSnapshot = onSnapshot(usersRef, (snapshot) => {
//         const usersList = [];
//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           // Hardcode: new users always show pending, only active if both status and is_active are true
//           const finalStatus = "pending"; // Always pending for now
          
//           console.log("DEBUG: Processing user", data.email, "- Raw status:", data.status, "is_active:", data.is_active, "Final status:", finalStatus);
//           usersList.push({
//             id: doc.id,
//             full_name: data.fullName || data.full_name || "Unknown User",
//             email: data.email || "No email",
//             created_by: data.created_by,
//             status: finalStatus,
//             is_active: data.is_active === true,
//             firebaseUid: data.firebaseUid,
//             created_at: data.created_at || new Date().toISOString(),
//           });
//         });

//         console.log("DEBUG: Loaded users:", usersList.length);
//         setUsers(usersList);
//       });

//       return () => unsubscribeSnapshot();
//     });

//     return () => unsubscribeAuth();
//   }, []);



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.full_name.trim() || !formData.email.trim()) {
//       setMessage("Please fill in all required fields");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const userData = {
//         fullName: formData.full_name.trim(),
//         email: formData.email.trim(),
//         status: "pending",
//         createdAt: new Date().toISOString()
//       };
      
//       const clientId = "8v3Mmi2BJ60ehQ9Dhqo3";
//       const usersRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "users");
      
//       const docRef = await addDoc(usersRef, userData);
//       console.log("User saved with ID:", docRef.id);

//       setFormData({ full_name: "", email: "" });
//       setMessage(`✅ User created successfully!`);
//       setTimeout(() => setMessage(""), 3000);
      
//     } catch (error) {
//       console.error("Error:", error);
//       setMessage("❌ Failed to create user: " + error.message);
//       setTimeout(() => setMessage(""), 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (userId) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         const clientId = profile?.clientId || profile?.id || "8v3Mmi2BJ60ehQ9Dhqo3";
//         await deleteDoc(doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "users", userId));
//         setMessage("User deleted successfully!");
//         setTimeout(() => setMessage(""), 3000);
//       } catch (error) {
//         console.error("Error deleting user:", error);
//         setMessage("Failed to delete user");
//         setTimeout(() => setMessage(""), 3000);
//       }
//     }
//   };

//   const createFirebaseUser = async (email) => {
//     try {
//       console.log("Creating Firebase user for:", email);
//       const tempPassword = `Temp${Date.now()}!`;
//       const userCredential = await createUserWithEmailAndPassword(
//         secondaryAuth,
//         email,
//         tempPassword
//       );
//       console.log("Firebase user created:", userCredential.user.uid);

//       await sendPasswordResetEmail(secondaryAuth, email);
//       console.log("Password reset email sent");

//       setMessage(
//         `✅ Firebase user created and password setup email sent to ${email}`
//       );
//       setTimeout(() => setMessage(""), 8000);
//     } catch (error) {
//       console.error("Error creating Firebase user:", error);
//       if (error.code === "auth/email-already-in-use") {
//         await resendPasswordEmail(email);
//       } else {
//         setMessage(`❌ Failed to create user: ${error.message}`);
//         setTimeout(() => setMessage(""), 8000);
//       }
//     }
//   };

//   const resendPasswordEmail = async (email) => {
//     try {
//       console.log("Attempting to send password reset email to:", email);
//       await sendPasswordResetEmail(secondaryAuth, email);
//       console.log("Password reset email sent successfully");
//       setMessage(`✅ Password setup email sent to ${email}`);
//       setTimeout(() => setMessage(""), 5000);
//     } catch (error) {
//       console.error("Error sending password reset email:", error);
//       if (error.code === "auth/user-not-found") {
//         setMessage(
//           `❌ User ${email} not found in Firebase Auth. Please create the user first.`
//         );
//       } else if (error.code === "auth/invalid-email") {
//         setMessage(`❌ Invalid email address: ${email}`);
//       } else {
//         setMessage(`❌ Failed to send email: ${error.message}`);
//       }
//       setTimeout(() => setMessage(""), 8000);
//     }
//   };

//   const toggleUserStatus = async (userId, currentStatus) => {
//     try {
//       // Only allow manual toggle for non-pending users
//       const user = users.find((u) => u.id === userId);
//       if (user && user.status === "pending") {
//         setMessage(
//           "❌ Cannot manually activate pending users. Users must set their password first."
//         );
//         setTimeout(() => setMessage(""), 5000);
//         return;
//       }

//       const clientId = profile?.clientId || profile?.id || "8v3Mmi2BJ60ehQ9Dhqo3";
//       await updateDoc(doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "users", userId), {
//         is_active: !currentStatus,
//         status: !currentStatus ? "active" : "pending",
//       });
//       setMessage("User status updated successfully!");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       console.error("Error updating user status:", error);
//       setMessage("Failed to update user status");
//       setTimeout(() => setMessage(""), 3000);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <ClientAdminHeader
//         profile={profile}
//         onProfileEdit={onProfileEdit}
//         onLogout={onLogout}
//       />

//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           User Management
//         </h1>
//         <p className="text-gray-600">Create and manage survey participants</p>
//       </div>

//       {message && (
//         <div
//           className={`mb-6 p-4 rounded-md ${
//             message.includes("success") || message.includes("✅")
//               ? "bg-green-50 text-green-700"
//               : "bg-red-50 text-red-700"
//           }`}
//         >
//           {message}
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
//                 <Label htmlFor="full_name">Full Name *</Label>
//                 <Input
//                   id="full_name"
//                   type="text"
//                   value={formData.full_name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, full_name: e.target.value })
//                   }
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   placeholder="Enter email address"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Password setup email will be sent automatically
//                 </p>
//               </div>

//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
//               >
//                 {loading ? "Creating..." : "Create User"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Users List */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="w-5 h-5" />
//               Survey Users ({users.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading && <p>Loading users...</p>}

//             <div className="space-y-4 max-h-96 overflow-y-auto">
//               {users.map((user) => (
//                 <div key={user.id} className="border rounded-lg p-4 bg-white">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Building className="w-4 h-4 text-gray-500" />
//                         <h3 className="font-semibold">{user.full_name}</h3>
//                         <span
//                           className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800"
//                         >
//                           Pending
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-1">
//                         Email: {user.email}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         Created:{" "}
//                         {new Date(user.created_at).toLocaleDateString()}
//                       </p>
//                     </div>

//                     <div className="flex gap-2 ml-4">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => createFirebaseUser(user.email)}
//                         title="Create Firebase user & send password email"
//                       >
//                         <UserPlus className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => resendPasswordEmail(user.email)}
//                         title="Resend password setup email"
//                       >
//                         <Mail className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() =>
//                           toggleUserStatus(user.id, user.is_active)
//                         }
//                       >
//                         {user.is_active ? (
//                           <UserX className="w-4 h-4" />
//                         ) : (
//                           <UserCheck className="w-4 h-4" />
//                         )}
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(user.id)}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {users.length === 0 && !loading && (
//                 <p className="text-gray-500 text-center py-8">No users found</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Users</p>
//                 <p className="text-2xl font-bold">{users.length}</p>
//               </div>
//               <Users className="w-8 h-8 text-blue-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Active Users
//                 </p>
//                 <p className="text-2xl font-bold">
//                   {users.filter((u) => u.status === "active").length}
//                 </p>
//               </div>
//               <UserCheck className="w-8 h-8 text-green-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Pending Users
//                 </p>
//                 <p className="text-2xl font-bold">
//                   {users.filter((u) => u.status === "pending").length}
//                 </p>
//               </div>
//               <Mail className="w-8 h-8 text-yellow-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Inactive Users
//                 </p>
//                 <p className="text-2xl font-bold">
//                   {users.filter((u) => u.status === "inactive").length}
//                 </p>
//               </div>
//               <UserX className="w-8 h-8 text-red-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ClientAdminDashboardAPI;
