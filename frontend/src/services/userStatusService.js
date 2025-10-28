import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

/**
 * Check if user exists in database
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if exists, false otherwise
 */
export const userExists = async (email) => {
  const { exists } = await getUserStatus(email);
  return exists;
};

/**
 * Activate user status when they successfully set their password and log in
 * @param {string} email - User email
 * @returns {Promise<boolean>} - Success status
 */
export const activateUser = async (email) => {
  try {
    console.log('Activating user:', email);
    
    // Find the user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('User not found:', email);
      return false;
    }
    
    // Update the first matching user
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Only activate if currently pending
    if (userData.status === "pending") {
      await updateDoc(doc(db, "users", userDoc.id), {
        status: "active",
        is_active: true,
        activatedAt: new Date().toISOString()
      });
      
      console.log('User activated successfully:', email);
      return true;
    } else {
      console.log('User already active or not pending:', email, userData.status);
      return true; // Return true even if already active to prevent duplicate creation
    }
    
  } catch (error) {
    console.error('Error activating user:', error);
    return false;
  }
};

/**
 * Check if user exists and get their status
 * @param {string} email - User email
 * @returns {Promise<{exists: boolean, status: string}>} - User existence and status
 */
export const getUserStatus = async (email) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { exists: false, status: null };
    }
    
    const userData = snapshot.docs[0].data();
    return { exists: true, status: userData.status || "pending" };
    
  } catch (error) {
    console.error('Error checking user status:', error);
    return { exists: false, status: null };
  }
};

/**
 * Check if user is pending activation
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if pending, false otherwise
 */
export const isUserPending = async (email) => {
  const { exists, status } = await getUserStatus(email);
  return exists && status === "pending";
};