import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

/**
 * Check if client admin exists in database
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - True if exists, false otherwise
 */
export const clientAdminExists = async (email) => {
  const { exists } = await getClientAdminStatus(email);
  return exists;
};

/**
 * Activate client admin status when they successfully set their password and log in
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - Success status
 */
export const activateClientAdmin = async (email) => {
  try {
    console.log('Activating client admin:', email);
    
    // Find the client admin by email
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    const q = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Client admin not found:', email);
      return false;
    }
    
    // Update the first matching client admin
    const clientDoc = snapshot.docs[0];
    const clientData = clientDoc.data();
    
    // Only activate if currently pending
    if (clientData.status === "pending") {
      await updateDoc(doc(db, "superadmin", superadminId, "clients", clientDoc.id), {
        status: "active",
        isActive: true,
        activatedAt: new Date().toISOString()
      });
      
      console.log('Client admin activated successfully:', email);
      return true;
    } else {
      console.log('Client admin already active or not pending:', email, clientData.status);
      return true; // Return true even if already active to prevent duplicate creation
    }
    
  } catch (error) {
    console.error('Error activating client admin:', error);
    return false;
  }
};

/**
 * Check if client admin exists and get their status
 * @param {string} email - Client admin email
 * @returns {Promise<{exists: boolean, status: string}>} - Client existence and status
 */
export const getClientAdminStatus = async (email) => {
  try {
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    const q = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { exists: false, status: null };
    }
    
    const clientData = snapshot.docs[0].data();
    return { exists: true, status: clientData.status || "pending" };
    
  } catch (error) {
    console.error('Error checking client admin status:', error);
    return { exists: false, status: null };
  }
};

/**
 * Check if client admin is pending activation
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - True if pending, false otherwise
 */
export const isClientAdminPending = async (email) => {
  const { exists, status } = await getClientAdminStatus(email);
  return exists && status === "pending";
};

/**
 * Check if client admin is active and can log in
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - True if active, false otherwise
 */
export const isClientAdminActive = async (email) => {
  const { exists, status } = await getClientAdminStatus(email);
  return exists && status === "active";
};

/**
 * Check if client admin is deactivated
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - True if deactivated, false otherwise
 */
export const isClientAdminDeactivated = async (email) => {
  try {
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    const q = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }
    
    const clientData = snapshot.docs[0].data();
    return clientData.isActive === false;
    
  } catch (error) {
    console.error('Error checking client deactivation status:', error);
    return false;
  }
};

/**
 * Check if client admin needs profile setup
 * @param {string} email - Client admin email
 * @returns {Promise<boolean>} - True if profile setup needed, false otherwise
 */
export const needsProfileSetup = async (email) => {
  try {
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    const q = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }
    
    const clientData = snapshot.docs[0].data();
    return clientData.is_first_time === false;
    
  } catch (error) {
    console.error('Error checking profile setup status:', error);
    return false;
  }
};

/**
 * Update client profile data and mark setup as complete
 * @param {string} email - Client admin email
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<boolean>} - Success status
 */
export const completeProfileSetup = async (email, profileData) => {
  try {
    const superadminId = "U0UjGVvDJoDbLtWAhyjp";
    const clientsRef = collection(db, "superadmin", superadminId, "clients");
    const q = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }
    
    const clientDoc = snapshot.docs[0];
    await updateDoc(doc(db, "superadmin", superadminId, "clients", clientDoc.id), {
      name: profileData.name,
      company_name: profileData.company_name,
      company_size: profileData.company_size,
      industry: profileData.industry,
      phone: profileData.phone,
      address: profileData.address,
      is_first_time: true,
      status: "active",
      isActive: true,
      activatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return true;
    
  } catch (error) {
    console.error('Error completing profile setup:', error);
    return false;
  }
};