import { getDatabase, ref, set, get, remove, query, orderByChild, equalTo } from 'firebase/database';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Card } from '../db/db';

// Initialize Firebase Realtime Database
const database = getDatabase();

/**
 * Service for interacting with Firebase Realtime Database
 * Used for real-time features like online status, analytics, and activity tracking
 */
export const realtimeDbService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Set user's online status
   */
  async setUserOnlineStatus(isOnline: boolean): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const userStatusRef = ref(database, `status/${user.uid}`);
      await set(userStatusRef, {
        isOnline,
        lastSeen: new Date().toISOString(),
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null
      });
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
      const viewEventRef = ref(database, `analytics/cardViews/${cardId}/${Date.now()}`);
      await set(viewEventRef, {
        timestamp: new Date().toISOString(),
        viewerInfo
      });
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
      const activityRef = ref(database, `cardActivity/${user.uid}/${cardId}/${Date.now()}`);
      await set(activityRef, {
        activity,
        timestamp: new Date().toISOString()
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
      // Get current stats
      const statsRef = ref(database, `cardStats/${cardId}`);
      const snapshot = await get(statsRef);
      const stats = snapshot.exists() ? snapshot.val() : { views: 0, downloads: 0, shares: 0 };
      
      // Update stats
      stats[statType] = (stats[statType] || 0) + 1;
      stats.lastUpdated = new Date().toISOString();
      
      // Save updated stats
      await set(statsRef, stats);
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
      const statsRef = ref(database, `cardStats/${cardId}`);
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const stats = snapshot.val();
        return {
          views: stats.views || 0,
          downloads: stats.downloads || 0,
          shares: stats.shares || 0
        };
      }
      
      return { views: 0, downloads: 0, shares: 0 };
    } catch (error) {
      console.error('Error getting card stats:', error);
      return null;
    }
  }
};

export default realtimeDbService;
