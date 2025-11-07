import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_CONFIG } from "./src/config/firebaseConfig.js";

const firebaseConfig = FIREBASE_CONFIG;

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
