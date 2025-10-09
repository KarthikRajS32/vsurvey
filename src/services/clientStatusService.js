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