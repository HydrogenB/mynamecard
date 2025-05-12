// Firebase Analytics Service using Firestore instead of Realtime DB
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  increment,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, firestore } from '../config/firebase';

// Collection names for analytics data
const USERS_COLLECTION = 'users';
const STATS_COLLECTION = 'cardStats';
const VIEWS_COLLECTION = 'cardViews';
const ACTIVITIES_COLLECTION = 'cardActivities';

/**
 * Service for analytics and real-time features using Firestore
 * Replaces functionality previously handled by Realtime Database
 */
export const firebaseAnalyticsService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Set user's online status in Firestore
   */
  async setUserOnlineStatus(isOnline: boolean): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const userStatusRef = doc(firestore, 'userStatus', user.uid);
      await setDoc(userStatusRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating online status:', error);
      return false;
    }
  },

  /**
   * Log card view event for analytics
   */
  async logCardView(cardId: string | number, viewerInfo: { isAuthenticated: boolean, uid?: string }): Promise<boolean> {
    try {
      const viewRef = doc(collection(firestore, VIEWS_COLLECTION));
      await setDoc(viewRef, {
        cardId,
        viewerInfo,
        timestamp: serverTimestamp()
      });

      // Also increment the views count in cardStats
      await this.updateCardStats(cardId, 'views');
      return true;
    } catch (error) {
      console.error('Error logging card view:', error);
      return false;
    }
  },

  /**
   * Track user activity on cards
   */
  async trackCardActivity(cardId: string | number, activity: 'view' | 'download' | 'share'): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const activityRef = doc(collection(firestore, ACTIVITIES_COLLECTION));
      await setDoc(activityRef, {
        userId: user.uid,
        cardId,
        activity,
        timestamp: serverTimestamp()
      });

      // Also update the user's activity list
      const userRef = doc(firestore, USERS_COLLECTION, user.uid);
      await updateDoc(userRef, {
        recentActivities: arrayUnion({
          cardId,
          activity,
          timestamp: serverTimestamp()
        })
      });

      return true;
    } catch (error) {
      console.error('Error tracking card activity:', error);
      return false;
    }
  },

  /**
   * Update card statistics
   */
  async updateCardStats(cardId: string | number, statType: 'views' | 'downloads' | 'shares'): Promise<boolean> {
    try {
      const statsRef = doc(firestore, STATS_COLLECTION, String(cardId));
      
      // Get current document to check if it exists
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        // Update existing stats
        const updateData: any = {
          lastUpdated: serverTimestamp()
        };
        updateData[statType] = increment(1);
        
        await updateDoc(statsRef, updateData);
      } else {
        // Create new stats document
        const initialStats: any = {
          cardId,
          views: 0,
          downloads: 0,
          shares: 0,
          lastUpdated: serverTimestamp()
        };
        initialStats[statType] = 1;
        
        await setDoc(statsRef, initialStats);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating card stats:', error);
      return false;
    }
  },

  /**
   * Get card statistics
   */
  async getCardStats(cardId: string | number): Promise<{ views: number, downloads: number, shares: number } | null> {
    try {
      const statsRef = doc(firestore, STATS_COLLECTION, String(cardId));
      const snapshot = await getDoc(statsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          views: data.views || 0,
          downloads: data.downloads || 0,
          shares: data.shares || 0
        };
      }
      
      return { views: 0, downloads: 0, shares: 0 };
    } catch (error) {
      console.error('Error getting card stats:', error);
      return null;
    }
  }
};

export default firebaseAnalyticsService;
