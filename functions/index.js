const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Test function to verify deployment
exports.testFunction = functions.https.onCall(async (data, context) => {
  console.log('Test function called');
  return { message: 'Cloud Function is working!', timestamp: new Date().toISOString() };
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  console.log('=== DELETE USER FUNCTION START ===');
  console.log('Input data:', JSON.stringify(data));
  console.log('Context auth exists:', !!context.auth);
  console.log('Context auth details:', context.auth ? {
    uid: context.auth.uid,
    email: context.auth.token?.email
  } : 'No auth');
  
  try {
    // Check authentication
    if (!context.auth) {
      console.log('ERROR: No authentication context');
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerEmail = context.auth.token.email;
    console.log('Caller email:', callerEmail);
    
    // Temporarily allow any authenticated user for testing
    // if (callerEmail !== 'superadmin@vsurvey.com') {
    //   console.log('Permission denied for email:', callerEmail);
    //   throw new functions.https.HttpsError('permission-denied', 'Only super admin can delete users');
    // }

    const { uid, clientId } = data;
    console.log('Target UID:', uid);
    console.log('Is client deletion:', !!clientId);
    
    if (!uid) {
      throw new functions.https.HttpsError('invalid-argument', 'UID is required');
    }

    let authDeleted = false;
    let firestoreDeleted = false;
    let authError = null;
    let firestoreError = null;

    // Check if user exists in Auth first
    try {
      const userRecord = await admin.auth().getUser(uid);
      console.log('User found in Auth:', userRecord.email, 'Status:', userRecord.disabled ? 'disabled' : 'active');
    } catch (getUserError) {
      console.log('User not found in Auth or error:', getUserError.message);
    }

    // Delete from Firebase Auth
    try {
      console.log('Attempting to delete from Firebase Auth:', uid);
      await admin.auth().deleteUser(uid);
      authDeleted = true;
      console.log('✅ Successfully deleted from Firebase Auth');
    } catch (error) {
      authError = error.message;
      console.error('❌ Auth deletion error:', error.message);
      console.error('Auth error code:', error.code);
    }

    // Delete from Firestore
    try {
      if (clientId) {
        console.log('Attempting to delete client document from Firestore');
        const docPath = `superadmin/U0UjGVvDJoDbLtWAhyjp/clients/${uid}`;
        console.log('Document path:', docPath);
        
        // Check if document exists first
        const docRef = admin.firestore().doc(docPath);
        const docSnap = await docRef.get();
        console.log('Document exists:', docSnap.exists);
        
        if (docSnap.exists) {
          await docRef.delete();
          console.log('✅ Successfully deleted client document');
        } else {
          console.log('⚠️ Client document does not exist');
        }
        firestoreDeleted = true;
      } else {
        console.log('Attempting to delete user document from Firestore');
        const docPath = `users/${uid}`;
        console.log('Document path:', docPath);
        
        // Check if document exists first
        const docRef = admin.firestore().doc(docPath);
        const docSnap = await docRef.get();
        console.log('Document exists:', docSnap.exists);
        
        if (docSnap.exists) {
          await docRef.delete();
          console.log('✅ Successfully deleted user document');
        } else {
          console.log('⚠️ User document does not exist');
        }
        firestoreDeleted = true;
      }
    } catch (error) {
      firestoreError = error.message;
      console.error('❌ Firestore deletion error:', error.message);
    }

    const result = {
      success: authDeleted && firestoreDeleted,
      authDeleted,
      firestoreDeleted,
      authError,
      firestoreError,
      message: authDeleted && firestoreDeleted 
        ? 'User deleted successfully from both Auth and Firestore'
        : authDeleted 
          ? `User deleted from Auth but Firestore deletion failed: ${firestoreError}`
          : firestoreDeleted
            ? `User deleted from Firestore but Auth deletion failed: ${authError}`
            : `Failed to delete user from both Auth and Firestore. Auth: ${authError}, Firestore: ${firestoreError}`
    };
    
    console.log('=== FINAL RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=== DELETE USER FUNCTION END ===');
    return result;

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new functions.https.HttpsError('internal', error.message);
  }
});