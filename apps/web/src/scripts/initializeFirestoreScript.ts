/**
 * Script to initialize Firestore collections and structure
 * Run this script during deployment or when setting up a new environment
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';
import initializeFirestore from '../utils/initializeFirestore';
// process is available globally in Node.js environments
// Using types-only import for process to satisfy TypeScript
// @ts-ignore
import type {} from 'node:process';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore (even though we're not directly using it in this file)
getFirestore(app);

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
      // Script will naturally exit when all operations complete
      // In Node.js environments, you would use process.exit(0) here
    }, 2000);
  })
  .catch((error: any) => {
    console.error('Script execution failed:', error);
    // Allow natural exit with error
    throw error;
  });
