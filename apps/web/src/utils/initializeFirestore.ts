// Firestore initialization utility - Fresh start approach
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { firestore, auth } from '../config/firebase';

// Collection names
const USERS_COLLECTION = 'users';
const CARDS_COLLECTION = 'cards';
const ADMIN_COLLECTION = 'admin';
const STATS_COLLECTION = 'cardStats';
const VIEWS_COLLECTION = 'cardViews';
const ACTIVITIES_COLLECTION = 'cardActivities';
const USER_STATUS_COLLECTION = 'userStatus';

/**
 * Utility to set up Firestore collections and initialize structure
 * Fresh start approach - no migration from previous data
 */
const initializeFirestore = async (options = { logProgress: true }): Promise<{
  success: boolean;
  collectionsInitialized: string[];
  errors: string[];
}> => {
  const result = {
    success: true,
    collectionsInitialized: [] as string[],
    errors: [] as string[]
  };

  try {
    if (options.logProgress) console.log('Initializing Firestore collections...');

    // Set up collection structure with sample documents if needed
    const batch = writeBatch(firestore);
    
    // 1. Initialize cards collection structure
    try {
      // Create a sample document to initialize collection structure
      const sampleCardDoc = doc(collection(firestore, CARDS_COLLECTION), 'sample-card');
      batch.set(sampleCardDoc, {
        firstName: 'Sample',
        lastName: 'User',
        slug: 'sample-card',
        userId: 'system',
                active: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      result.collectionsInitialized.push(CARDS_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing cards collection:', error);
    }
    
    // 2. Initialize admin collection with card limits
    try {
      const cardLimitsDoc = doc(firestore, ADMIN_COLLECTION, 'card_limits');
      batch.set(cardLimitsDoc, {
        free: 2,
        pro: 999,
        updatedAt: serverTimestamp()
      });
      result.collectionsInitialized.push(ADMIN_COLLECTION);
    } catch (error) {
      if (options.logProgress) console.error('Error initializing admin collection:', error);
    }
    
    // 3. Initialize cardStats collection structure
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
    
    // 4. Initialize cardViews collection structure
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
    
    // 5. Initialize cardActivities collection structure
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
    
    // 6. Initialize userStatus collection structure
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
