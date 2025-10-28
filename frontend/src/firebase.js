// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuvvUIiOzx4AVE9FTXaubNGrj0rTypihU",
  authDomain: "vsurvey-68195.firebaseapp.com",
  projectId: "vsurvey-68195",
  storageBucket: "vsurvey-68195.firebasestorage.app",
  messagingSenderId: "669564501775",
  appId: "1:669564501775:web:0f69ced66244252014887a",
  measurementId: "G-ZGP8L9HKY4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;