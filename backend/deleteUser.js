const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');

exports.deleteUser = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = request.data;

  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  try {
    // Delete user from Firebase Authentication
    await getAuth().deleteUser(uid);
    console.log('Successfully deleted user from Firebase Auth:', uid);
    
    return { success: true, message: 'User deleted from Firebase Authentication' };
  } catch (error) {
    console.error('Error deleting user from Firebase Auth:', error);
    throw new HttpsError('internal', 'Failed to delete user from Firebase Authentication');
  }
});