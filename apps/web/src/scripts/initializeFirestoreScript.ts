/**
 * Script to initialize Firestore collections and structure
 * Run this script during deployment or when setting up a new environment
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';
import initializeFirestore from '../utils/initializeFirestore';
import * as process from 'process';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Run the initialization process
 */
async function initializeFirestoreCollections() {
  try {
    console.log('Starting Firestore initialization...');
    
    // Run the initialization utility
    const result = await initializeFirestore({ logProgress: true });
    
    if (result.success) {
      console.log('✅ Firestore initialization completed successfully!');
      console.log('Collections initialized:', result.collectionsInitialized.join(', '));
    } else {
      console.error('⚠️ Firestore initialization completed with errors');
      console.error('Errors:', result.errors);
    }
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
}

// Execute the initialization
initializeFirestoreCollections()
  .then(() => {
    console.log('Script execution complete');
    // Wait for any pending Firebase operations to complete before exiting
    setTimeout(() => {
      console.log('Exiting script...');
      process.exit(0);
    }, 2000);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
