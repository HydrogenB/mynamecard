import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { env } from './environment';

// Firebase API key for authentication
const FIREBASE_API_KEY = "AIzaSyB1b0fKw8PCBw-slGJa7N1cMUSNTnaxchY";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "mynamecard-2c393.firebaseapp.com",
  databaseURL: "https://mynamecard-2c393-default-rtdb.firebaseio.com",
  projectId: "mynamecard-2c393",
  storageBucket: "mynamecard-2c393.firebasestorage.app",
  messagingSenderId: "668925791300",
  appId: "1:668925791300:web:b7e475de4fe84c79d98011",
  measurementId: "G-BR7HTT61FS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to Functions emulator in development
if (import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development') {
  console.log('Connecting to Firebase Functions emulator on localhost:5001');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

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
