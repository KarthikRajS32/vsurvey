const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'vsurvey-test'
  });
}

app.post('/deleteUser', async (req, res) => {
  try {
    const { uid, email } = req.body;
    
    if (!uid && !email) {
      return res.status(400).json({ error: 'UID or email is required' });
    }
    
    // Delete user from Firebase Auth
    if (uid) {
      await admin.auth().deleteUser(uid);
    } else if (email) {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(userRecord.uid);
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Delete user API running on port ${PORT}`);
});