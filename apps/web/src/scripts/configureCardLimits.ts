/**
 * Script to configure default card limits in Firestore
 * Run this script to set up the initial configuration for card limits
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';
// process is available globally in Node.js environments
// Using types-only import for process to satisfy TypeScript
// @ts-ignore
import type {} from 'node:process';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Configure default card limits for different subscription plans
 */
export async function configureCardLimits() {
  try {
    // Define default card limits
    const cardLimits = {
      free: 2,         // Free users can create 2 cards by default
      pro: 999,        // Pro users can create "unlimited" (999 as a high limit) cards
      updatedAt: serverTimestamp()
    };
    
    console.log('Setting default card limits:', cardLimits);
    // Store in Firestore system_config collection
    const configRef = doc(firestore, 'system_config', 'card_limits');
    await setDoc(configRef, cardLimits);
    
    console.log('Default card limits configured successfully!');
  } catch (error) {
    console.error('Error configuring card limits:', error);
  }
}

// Execute the configuration
configureCardLimits()
  .then(() => {
    console.log('Configuration complete');
    // Wait for any pending Firebase operations to complete before exiting
    setTimeout(() => {
      console.log('Exiting script...');
      // Script will naturally exit when all operations complete
    }, 2000);
  })
  .catch((error: any) => {
    console.error('Configuration failed:', error);
    // Allow natural exit with error
    throw error;
  });
