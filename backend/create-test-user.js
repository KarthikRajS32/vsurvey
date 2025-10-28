import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './src/firebase.js';

async function createTestUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'test@example.com', 
      'password123'
    );
    console.log('User created:', userCredential.user.email);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUser();
