import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
  authDomain: "vsurvey-68195.firebaseapp.com",
  projectId: "vsurvey-68195",
  storageBucket: "vsurvey-68195.firebasestorage.app",
  messagingSenderId: "669564501775",
  appId: "1:669564501775:web:0f69ced66244252014887a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createTestUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'test@example.com', 
      'password123'
    );
    console.log('User created:', userCredential.user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
