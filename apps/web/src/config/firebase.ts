import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Firebase API key for authentication
const FIREBASE_API_KEY = "AIzaSyAnKYbr1YaEL14GtsUcnC7vEmwxx4u6SzM";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "mynamecard-2c393.firebaseapp.com",
  projectId: "mynamecard-2c393",
  storageBucket: "mynamecard-2c393.appspot.com",
  messagingSenderId: "428846201204",
  appId: "1:428846201204:web:05306353548d9541d94cbc",
  measurementId: "G-C78MBVW9G9",
  databaseURL: "https://mynamecard-2c393-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

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
