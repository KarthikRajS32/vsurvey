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
  X,
  FileText,
  HelpCircle,
} from "lucide-react";
import TopBar from "../TapBar/TopBar";
import SuperAdminSidebar from "../SideBar/SuperAdminSidebar";
import SurveyResult from "./SurveyResult";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { setSuperAdminUpdateCallback } from "../../../services/superAdminNotification";

import { FIREBASE_CONFIG } from "../../../config/firebaseConfig";

// Create separate Firebase app for user creation (doesn't affect main auth state)
const secondaryApp = initializeApp(FIREBASE_CONFIG, "secondary");

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
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    users: [],
    surveys: [],
    questions: []
  });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

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

      // Create client document using Firebase UID as document ID
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      const clientDocRef = doc(db, "superadmin", superadminId, "clients", userCredential.user.uid);

      const newClient = {
        activatedAt: "",
        clientId: formData.clientId.trim() || `client_${Date.now()}`,
        createdAt: new Date().toISOString(),
        email: formData.email.trim(),
        firebaseUid: userCredential.user.uid,
        isActive: false,
        status: "pending",
        address: "",
        company_name: formData.name.trim(),
        company_size: "",
        emailVerified: true,
        industry: "",
        is_first_time: false,
        name: "",
        phone: "",
        updated_at: new Date().toISOString(),
        tempPassword: tempPassword, // Store for deletion purposes
      };

      await setDoc(clientDocRef, newClient);
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

  const openEditModal = (e, client) => {
    e.stopPropagation();
    setEditingClient(client);
    setEditFormData({ name: client.company_name || client.name });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClient(null);
    setEditFormData({ name: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      await updateDoc(
        doc(db, "superadmin", superadminId, "clients", editingClient.id),
        { company_name: editFormData.name.trim() }
      );
      setMessage("Client updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      closeEditModal();
      loadClients();
    } catch (error) {
      console.error("Error updating client:", error);
      setMessage("Failed to update client");
    }
  };

  const openDeleteModal = (e, client) => {
    e.stopPropagation();
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      console.log("=== STARTING CLIENT DELETION ===");
      console.log("Client ID:", clientToDelete.id);
      console.log("Firebase UID:", clientToDelete.firebaseUid);
      console.log("Client Status:", clientToDelete.status);
      console.log("Client Email:", clientToDelete.email);
      console.log("Has Temp Password:", !!clientToDelete.tempPassword);
      
      let authDeleted = false;
      let firestoreDeleted = false;
      
      // Delete from Firebase Auth
      const firebaseUid = clientToDelete.firebaseUid || clientToDelete.id;
      console.log("Using Firebase UID for deletion:", firebaseUid);
      
      try {
        // Try to delete from Firebase Auth
        if (clientToDelete.status === 'pending' && clientToDelete.tempPassword) {
          // Use stored temporary password for pending users
          await signInWithEmailAndPassword(secondaryAuth, clientToDelete.email, clientToDelete.tempPassword);
          if (secondaryAuth.currentUser) {
            await deleteUser(secondaryAuth.currentUser);
            authDeleted = true;
            console.log('Pending client deleted from Firebase Auth');
          }
        } else {
          // For active clients, try with current user's ID token
          console.log(`Attempting authenticated deletion for active client: ${firebaseUid}`);
          try {
            // Get current user's ID token
            const currentUser = auth.currentUser;
            if (currentUser) {
              const idToken = await currentUser.getIdToken();
              console.log('Got ID token for authenticated request');
              
              const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${import.meta.env.VITE_FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  idToken: idToken,
                  localId: firebaseUid
                })
              });
              
              console.log(`REST API response status: ${response.status}`);
              const responseData = await response.text();
              console.log('REST API response:', responseData);
              
              if (response.ok) {
                authDeleted = true;
                console.log('Active client deleted from Firebase Auth via REST API');
              } else {
                console.warn(`REST API deletion failed with status ${response.status}: ${responseData}`);
              }
            } else {
              console.warn('No current user for ID token');
            }
          } catch (restError) {
            console.error('REST API deletion error:', restError);
          }
        }
      } catch (authError) {
        console.warn('Firebase Auth deletion failed:', authError.message);
      }
      
      // Delete from Firestore
      try {
        const superadminId = "U0UjGVvDJoDbLtWAhyjp";
        await deleteDoc(
          doc(db, "superadmin", superadminId, "clients", clientToDelete.id)
        );
        firestoreDeleted = true;
        console.log('Client deleted from Firestore');
      } catch (firestoreError) {
        console.error('Firestore deletion failed:', firestoreError);
      }
      
      // Final deletion summary
      console.log("=== DELETION SUMMARY ===");
      console.log("Auth Deleted:", authDeleted);
      console.log("Firestore Deleted:", firestoreDeleted);
      
      // Show appropriate message
      if (authDeleted && firestoreDeleted) {
        setMessage("✅ Client deleted completely from both Authentication and Database!");
        console.log("SUCCESS: Complete deletion");
      } else if (firestoreDeleted) {
        setMessage("✅ Client deleted from Database. Authentication deletion may require manual cleanup.");
        console.log("PARTIAL: Firestore deleted, Auth deletion failed");
      } else {
        setMessage("❌ Failed to delete client from Database.");
        console.log("FAILED: Both deletions failed");
      }
      
      setTimeout(() => setMessage(""), 5000);
      closeDeleteModal();
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      setMessage("Failed to delete client admin");
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

  const toggleClientStatus = async (clientId, currentIsActive) => {
    try {
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      const newIsActive = !currentIsActive;
      const newStatus = newIsActive ? "active" : "inactive";
      
      // Update client status
      await updateDoc(
        doc(db, "superadmin", superadminId, "clients", clientId),
        {
          isActive: newIsActive,
          status: newStatus
        }
      );
      
      // If deactivating client, also deactivate all users under this client
      if (!newIsActive) {
        const client = clientAdmins.find(c => c.id === clientId);
        if (client) {
          const globalUsersRef = collection(db, "users");
          const globalUsersSnapshot = await getDocs(globalUsersRef);
          
          const updatePromises = [];
          globalUsersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.created_by === client.email) {
              updatePromises.push(
                updateDoc(doc(db, "users", userDoc.id), {
                  status: "inactive",
                  is_active: false
                })
              );
            }
          });
          
          await Promise.all(updatePromises);
          console.log(`Deactivated ${updatePromises.length} users under client ${client.email}`);
        }
      }
      
      setMessage(`Client ${newIsActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating client status:", error);
      setMessage("Failed to update client status");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    localStorage.removeItem("currentSuperAdmin");
    localStorage.removeItem("currentClientAdmin");
    localStorage.removeItem("currentUser");
    window.location.replace('/');
  };

  const fetchClientDetails = async (clientId, client = selectedClient) => {
    try {
      setLoadingDetails(true);
      const superadminId = "U0UjGVvDJoDbLtWAhyjp";
      
      // Fetch users from global users collection filtered by created_by
      let users = [];
      try {
        const globalUsersRef = collection(db, "users");
        const globalUsersSnapshot = await getDocs(globalUsersRef);
        
        globalUsersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.created_by === client?.email) {
            users.push({ id: doc.id, ...userData });
          }
        });
      } catch (error) {
        console.error("Error fetching from global users collection:", error);
      }
      
      // Fetch surveys
      const surveysRef = collection(db, "superadmin", superadminId, "clients", clientId, "surveys");
      const surveysSnapshot = await getDocs(surveysRef);
      const surveys = [];
      surveysSnapshot.forEach((doc) => {
        surveys.push({ id: doc.id, ...doc.data() });
      });
      
      // Fetch questions
      const questionsRef = collection(db, "superadmin", superadminId, "clients", clientId, "questions");
      const questionsSnapshot = await getDocs(questionsRef);
      const questions = [];
      questionsSnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Final client details:', { users: users.length, surveys: surveys.length, questions: questions.length });
      setClientDetails({ users, surveys, questions });
    } catch (error) {
      console.error("Error fetching client details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openClientModal = async (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
    await fetchClientDetails(client.id, client);
  };

  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setSelectedClient(null);
    setClientDetails({ users: [], surveys: [], questions: [] });
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
                        className="border rounded-lg p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => openClientModal(admin)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-gray-500" />
                              <h3 className="font-semibold">{admin.company_name || admin.name}</h3>
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
                              onClick={(e) => resendPasswordEmail(admin.email) && e.stopPropagation()}
                              title="Resend password setup email"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {admin.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClientStatus(admin.id, admin.isActive);
                                }}
                                title="Deactivate client"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                            {admin.status === "inactive" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClientStatus(admin.id, admin.isActive);
                                }}
                                title="Activate client"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => openEditModal(e, admin)}
                              title="Edit client"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => openDeleteModal(e, admin)}
                              title="Delete client"
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
        return <SurveyResult />;
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

      {/* Client Details Modal */}
      {isClientModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedClient.company_name || selectedClient.name}
                </h2>
                <p className="text-gray-600">{selectedClient.email}</p>
              </div>
              <button
                onClick={closeClientModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading client details...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                          Users
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {clientDetails.users.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          Surveys
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {clientDetails.surveys.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">
                          Questions
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {clientDetails.questions.length}
                      </p>
                    </div>
                  </div>

                  {/* Users Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Users ({clientDetails.users.length})
                    </h3>
                    {clientDetails.users.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {clientDetails.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between bg-white p-3 rounded border"
                            >
                              <div>
                                <p className="font-medium">
                                  {user.full_name || user.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {user.email}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : user.status === "inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {user.status || "pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No users created yet
                      </p>
                    )}
                  </div>

                  {/* Surveys Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Surveys ({clientDetails.surveys.length})
                    </h3>
                    {clientDetails.surveys.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {clientDetails.surveys.map((survey) => (
                            <div
                              key={survey.id}
                              className="bg-white p-3 rounded border"
                            >
                              <p className="font-medium">{survey.name}</p>
                              <p className="text-sm text-gray-600">
                                Questions:{" "}
                                {survey.questionCount ||
                                  survey.questions?.length ||
                                  0}
                              </p>
                              <p className="text-sm text-gray-500">
                                Created:{" "}
                                {survey.createdAt
                                  ? new Date(
                                      survey.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No surveys created yet
                      </p>
                    )}
                  </div>

                  {/* Questions Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Questions ({clientDetails.questions.length})
                    </h3>
                    {clientDetails.questions.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {clientDetails.questions.map((question) => (
                            <div
                              key={question.id}
                              className="bg-white p-3 rounded border"
                            >
                              <p className="font-medium">{question.text}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  Type: {question.type}
                                </span>
                                {question.options &&
                                  question.options.length > 0 && (
                                    <span className="text-sm text-gray-600">
                                      Options: {question.options.length}
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No questions created yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={closeClientModal} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Client</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="editName">Company Name *</Label>
                <Input
                  id="editName"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Admin Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingClient.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editClientId">Client ID</Label>
                <Input
                  id="editClientId"
                  type="text"
                  value={editingClient.clientId || editingClient.id}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editCreated">Created</Label>
                <Input
                  id="editCreated"
                  type="text"
                  value={new Date(editingClient.createdAt).toLocaleDateString()}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Client</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Delete
              </h2>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <strong>{clientToDelete.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboardAPI;