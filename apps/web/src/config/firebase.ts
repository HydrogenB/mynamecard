import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase API key for authentication
const FIREBASE_API_KEY = "AIzaSyB1b0fKw8PCBw-slGJa7N1cMUSNTnaxchY";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "mynamecard-2c393.firebaseapp.com",
  projectId: "mynamecard-2c393",
  storageBucket: "mynamecard-2c393.firebasestorage.app",
  messagingSenderId: "668925791300",
  appId: "1:668925791300:web:b7e475de4fe84c79d98011",
  measurementId: "G-BR7HTT61FS"
  // Removed databaseURL as we're using Firestore exclusively
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  });
