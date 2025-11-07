import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Plus, Users, Building, Edit, Edit3, Trash2, Mail, UserPlus, UserCheck, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import ClientAdminHeader from "./ClientAdminHeader";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, setDoc, updateDoc, getDocs, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { FIREBASE_CONFIG } from "../../../config/firebaseConfig";

// Create secondary Firebase app for user creation
const secondaryApp = initializeApp(FIREBASE_CONFIG, "secondary");

const secondaryAuth = getAuth(secondaryApp);

const CreateUsersAPI = ({ profile, onProfileEdit, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
  });

  // Get client ID and superadmin ID dynamically
  const [clientId, setClientId] = useState(null);
  const [superadminId, setSuperadminId] = useState(null);

  // Function to get client ID using client email
  const getClientData = async (clientEmail) => {
    try {
      console.log('Searching for client with email:', clientEmail);
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      const clientsRef = collection(db, "superadmin", superadminId, "clients");
      const q = query(clientsRef, where("email", "==", clientEmail));
      const clientsSnapshot = await getDocs(q);
      console.log('Found clients:', clientsSnapshot.docs.length);
      
      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        console.log('Match found! Client ID:', clientDoc.id, 'Superadmin ID:', superadminId);
        return { clientId: clientDoc.id, superadminId: superadminId };
      }
      
      console.log('No matching client found');
      return { clientId: null, superadminId: null };
    } catch (error) {
      console.error("Error getting client data:", error);
      return { clientId: null, superadminId: null };
    }
  };

  useEffect(() => {
    const initializeClientData = async () => {
      try {
        // Wait for auth to be ready
        const currentUser = auth.currentUser;
        if (!currentUser?.email) {
          console.log('Auth not ready, retrying in 1 second...');
          setTimeout(initializeClientData, 1000);
          return;
        }
        
        console.log('Getting client data for user:', currentUser.email);
        const { clientId: id, superadminId: superAdminId } = await getClientData(currentUser.email);
        console.log('Retrieved client data:', { clientId: id, superadminId: superAdminId });
        
        if (!id) {
          console.warn('Unable to find client ID, but continuing with email-based queries');
        }
        setClientId(id);
        setSuperadminId(superAdminId);
      } catch (err) {
        console.error('Failed to get client data:', err.message);
      }
    };
    
    initializeClientData();
  }, []);

  useEffect(() => {
    const setupUserListener = async () => {
      try {
        setInitializing(true);
        
        // Wait for auth to be ready
        const currentUser = auth.currentUser;
        if (!currentUser?.email) {
          // Wait a bit for auth to initialize
          setTimeout(setupUserListener, 1000);
          return;
        }
        
        console.log('Setting up user listener for:', currentUser.email);
        
        const usersRef = collection(db, "users");
        const q = query(
          usersRef, 
          where("created_by", "==", currentUser.email)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Users snapshot received, count:', snapshot.docs.length);
          const usersData = snapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            console.log('User data:', data);
            return data;
          }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort in JavaScript
          setUsers(usersData);
          setInitializing(false);
        }, (error) => {
          console.error('Error in users listener:', error);
          setError('Failed to load users: ' + error.message);
          setInitializing(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up user listener:', error);
        setError('Failed to initialize user listener');
        setInitializing(false);
      }
    };
    
    let unsubscribe;
    setupUserListener().then(unsub => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Remove clientId dependency

  console.log('Using clientId:', clientId);
  console.log('Profile:', profile);
  console.log('Database path will be: superadmin/U0UjGVvDJoDbLtWAhyjp/clients/' + clientId + '/users');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setLoading(false);
      return;
    }

    try {
      // Get current user (client) email for created_by field
      const currentUser = auth.currentUser;
      if (!currentUser?.email) {
        throw new Error('User not authenticated. Please log in again.');
      }
      const clientEmail = currentUser.email;

      // First create Firebase user to get the UID
      console.log("Creating Firebase user for:", formData.email.trim());
      const tempPassword = `Temp${Date.now()}!`;
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email.trim(),
        tempPassword
      );
      const firebaseUID = userCredential.user.uid;
      console.log("Firebase user created with UID:", firebaseUID);

      // Send password reset email
      await sendPasswordResetEmail(secondaryAuth, formData.email.trim());
      console.log("Password reset email sent");

      // Get fresh client data at time of user creation
      console.log('Getting fresh client data for user creation...');
      const { clientId: currentClientId, superadminId: currentSuperadminId } = await getClientData(clientEmail);
      console.log('Fresh client data:', { clientId: currentClientId, superadminId: currentSuperadminId });
      console.log('User data will include:', { client_id: currentClientId, superadmin_id: currentSuperadminId });
      
      // Create user document with Firebase UID as document ID
      const userData = {
        city: "",
        created_at: new Date().toISOString(),
        created_by: clientEmail,
        education: "",
        email: formData.email.trim(),
        email_verified: true,
        full_name: formData.full_name.trim(),
        gender: "",
        id: firebaseUID,
        is_active: true,
        status: "pending",
        is_profile_complete: false,
        phone: "",
        profile_photo: "",
        updated_at: new Date().toISOString(),
        client_id: currentClientId,
        superadmin_id: currentSuperadminId
      };

      console.log('Creating user document with Firebase UID as document ID:', firebaseUID);
      const userDocRef = doc(db, "users", firebaseUID);
      await setDoc(userDocRef, userData);
      
      console.log('✅ User successfully added to /users collection with Firebase UID as document ID');

      setFormData({ full_name: "", email: "" });
      setMessage(`✅ User created successfully! Password setup email sent to ${formData.email.trim()}`);
      setTimeout(() => setMessage(""), 8000);
    } catch (err) {
      setMessage(`❌ Failed to create user: ${err.message}`);
      setTimeout(() => setMessage(""), 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setLoading(true);
      const user = users.find(u => u.id === userId);
      
      let newIsActive, newStatus;
      if (user.status === "pending") {
        newIsActive = true;
        newStatus = "active";
      } else {
        newIsActive = !user.is_active;
        newStatus = newIsActive ? "active" : "inactive";
      }
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        is_active: newIsActive,
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      setMessage(`✅ User ${newIsActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Failed to update user status: ${err.message}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setLoading(true);
        
        let authDeleted = false;
        let firestoreDeleted = false;
        
        // Delete from Firebase Auth using secondary auth (admin privileges)
        try {
          await deleteUser(secondaryAuth.currentUser || { uid: userToDelete.id });
          authDeleted = true;
          console.log('User deleted from Firebase Auth');
        } catch (authError) {
          console.warn('Firebase Auth deletion failed:', authError);
        }
        
        // Delete from Firestore
        try {
          const userRef = doc(db, "users", userToDelete.id);
          await deleteDoc(userRef);
          firestoreDeleted = true;
          console.log('User deleted from Firestore');
        } catch (firestoreError) {
          console.error('Firestore deletion failed:', firestoreError);
        }
        
        // Show appropriate message
        if (authDeleted && firestoreDeleted) {
          setMessage("✅ User deleted from both Authentication and Database!");
        } else if (firestoreDeleted) {
          setMessage("✅ User deleted from Database. Authentication deletion may have failed.");
        } else {
          setMessage("❌ Failed to delete user.");
        }
        
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setMessage(`❌ Failed to delete user: ${err.message}`);
        setTimeout(() => setMessage(""), 5000);
      } finally {
        setLoading(false);
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
    
    try {
      setLoading(true);
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        full_name: editFormData.full_name.trim(),
        updated_at: new Date().toISOString()
      });
      
      setMessage("✅ User updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Failed to update user: ${err.message}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
      setEditingUser(null);
    }
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage survey participants
          </p>
        </div>

      {(message || error) && (
        <div
          className={`mb-6 p-4 rounded-md ${
            (message && (message.includes("success") || message.includes("✅")))
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
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
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
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
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
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
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Survey Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(loading || initializing) && <p>Loading users...</p>}
            {!initializing && !auth.currentUser && (
              <p className="text-red-600">Please log in to view users.</p>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "active" ? "Active" : user.status === "pending" ? "Pending" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Email: {user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendPasswordEmail(user.email)}
                        title="Resend password setup email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      {user.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title="Activate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {user.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title="Deactivate User"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                      {user.status === "inactive" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title="Activate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        title="Edit user"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && !loading && !initializing && auth.currentUser && (
                <p className="text-gray-500 text-center py-8">No users found</p>
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === "active").length}
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
                  Pending Users
                </p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === "pending").length}
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
                  Inactive Users
                </p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === "inactive").length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Full Name *</Label>
                <Input
                  id="edit_full_name"
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
                <Label htmlFor="edit_email">Email Address *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="bg-gray-100"
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
      )}

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
                className="flex-1 bg-red-600 hover:bg-red-700"
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
