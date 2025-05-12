/**
 * Script to configure default card limits in Firestore
 * Run this script to set up the initial configuration for card limits
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Configure default card limits for different subscription plans
 */
async function configureCardLimits() {
  try {
    // Define default card limits
    const cardLimits = {
      free: 2,         // Free users can create 2 cards by default
      pro: 999,        // Pro users can create "unlimited" (999 as a high limit) cards
      updatedAt: serverTimestamp()
    };
    
    console.log('Setting default card limits:', cardLimits);
    
    // Store in Firestore admin collection
    const configRef = doc(firestore, 'admin', 'card_limits');
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
      process.exit(0);
    }, 2000);
  })
  .catch((error) => {
    console.error('Configuration failed:', error);
    process.exit(1);
  });
