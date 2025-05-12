// Firestore initialization utility
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { auth } from '../config/firebase';

const firestore = getFirestore();

// Collection names
const USERS_COLLECTION = 'users';
const STATS_COLLECTION = 'cardStats';
const VIEWS_COLLECTION = 'cardViews';
const ACTIVITIES_COLLECTION = 'cardActivities';
const USER_STATUS_COLLECTION = 'userStatus';

/**
 * Utility to set up Firestore collections and initialize structure
 * This replaces the old migration utility that transferred data from Realtime DB
 */
export const initializeFirestore = async (options = { logProgress: true }): Promise<{
  success: boolean;
  collectionsInitialized: string[],
  errors: string[]
}> {
  const result = {
    success: true,
    collectionsInitialized: [] as string[],
    errors: [] as string[]
  };

  try {
    if (options.logProgress) console.log('Initializing Firestore collections...');

    // Set up collection structure with sample documents if needed
    const batch = writeBatch(firestore);
    
    // 1. Initialize cardStats collection structure
    try {
      // Create a sample document to initialize collection structure
      const statsDoc = doc(firestore, STATS_COLLECTION, 'sample');
      batch.set(statsDoc, {
        views: 0,
        downloads: 0,
        shares: 0,
        lastUpdated: serverTimestamp()
      });
      result.collectionsInitialized.push(STATS_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing cardStats collection:', error);
    }
    
    // 2. Initialize cardViews collection structure
    try {
      const viewsDoc = doc(collection(firestore, VIEWS_COLLECTION));
      batch.set(viewsDoc, {
        cardId: 'sample',
        timestamp: serverTimestamp(),
        viewerInfo: { isAuthenticated: false }
      });
      result.collectionsInitialized.push(VIEWS_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing cardViews collection:', error);
    }
    
    // 3. Initialize cardActivities collection structure
    try {
      const activityDoc = doc(collection(firestore, ACTIVITIES_COLLECTION));
      batch.set(activityDoc, {
        userId: 'sample',
        cardId: 'sample',
        activity: 'view',
        timestamp: serverTimestamp()
      });
      result.collectionsInitialized.push(ACTIVITIES_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing cardActivities collection:', error);
    }
    
    // 4. Initialize userStatus collection structure
    try {
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid || 'sample';
      const userStatusDoc = doc(firestore, USER_STATUS_COLLECTION, userId);
      batch.set(userStatusDoc, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        displayName: currentUser?.displayName || 'Sample User',
        photoURL: currentUser?.photoURL || null
      });
      result.collectionsInitialized.push(USER_STATUS_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing userStatus collection:', error);
    }
    
    // Commit all the initialization operations
    await batch.commit();
    
    if (options.logProgress) {
      console.log(`Successfully initialized ${result.collectionsInitialized.length} collections:`);
      result.collectionsInitialized.forEach(collection => {
        console.log(` - ${collection}`);
      });
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message || 'Unknown error during initialization');
    if (options.logProgress) console.error('Error during Firestore initialization:', error);
  }
  
  return result;
};

export default initializeFirestore;
