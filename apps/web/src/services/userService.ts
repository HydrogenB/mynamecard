import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { User } from 'firebase/auth';

interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  plan: 'free' | 'pro';
  cardLimit: number;
  cardsCreated: number;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'users';
const DEFAULT_CARD_LIMIT = 2; // Default limit of 2 cards per user

/**
 * User service for handling user data in Firestore
 */
export const userService = {
  /**
   * Create a user profile in Firestore after registration
   */
  async createUserProfile(user: User): Promise<UserData> {
    const userRef = doc(firestore, COLLECTION_NAME, user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      plan: 'free' as const,
      cardLimit: DEFAULT_CARD_LIMIT, // Free users can have 2 cards by default
      cardsCreated: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, userData);
    
    return {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  
  /**
   * Get user data from Firestore
   */
  async getUserProfile(uid: string): Promise<UserData | null> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as UserData;
  },
  
  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserData>): Promise<boolean> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    
    try {
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },
  
  /**
   * Upgrade user to Pro plan
   */
  async upgradeToPro(uid: string): Promise<boolean> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    
    try {
      await updateDoc(userRef, {
        plan: 'pro',
        cardLimit: 999, // Pro users can have unlimited cards (using 999 as a high limit)
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error upgrading user to pro:', error);
      return false;
    }
  },
  
  /**
   * Check if user can create more cards
   */
  async canCreateCard(uid: string): Promise<boolean> {
    const userProfile = await this.getUserProfile(uid);
    
    if (!userProfile) {
      return false;
    }
    
    return userProfile.cardsCreated < userProfile.cardLimit;
  },
  
  /**
   * Increment the cardsCreated count when a user creates a new card
   */
  async incrementCardsCreated(uid: string): Promise<boolean> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    await updateDoc(userRef, {
      cardsCreated: (userData.cardsCreated || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    return true;
  },
  
  /**
   * Decrement the cardsCreated count when a user deletes a card
   */
  async decrementCardsCreated(uid: string): Promise<boolean> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    const currentCount = userData.cardsCreated || 0;
    
    await updateDoc(userRef, {
      cardsCreated: Math.max(0, currentCount - 1), // Ensure we don't go below 0
      updatedAt: serverTimestamp()
    });
    
    return true;
  },
  
  /**
   * Update user card limit (admin function)
   */
  async updateCardLimit(uid: string, newLimit: number): Promise<boolean> {
    const userRef = doc(firestore, COLLECTION_NAME, uid);
    
    try {
      await updateDoc(userRef, {
        cardLimit: newLimit,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating card limit:', error);
      return false;
    }
  },
  
  /**
   * Admin function to configure default card limits for plans
   * This should be used by admins only
   */
  async configureCardLimits(limits: { free: number, pro: number }): Promise<boolean> {
    try {
      const configRef = doc(firestore, 'admin', 'card_limits');
      await setDoc(configRef, {
        free: limits.free,
        pro: limits.pro,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error configuring card limits:', error);
      return false;
    }
  },
  
  /**
   * Get the default card limits for plans
   */
  async getDefaultCardLimits(): Promise<{ free: number, pro: number }> {
    try {
      const configRef = doc(firestore, 'admin', 'card_limits');
      const docSnap = await getDoc(configRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          free: data.free || 2,
          pro: data.pro || 999
        };
      }
      
      // Return defaults if not configured
      return {
        free: 2,
        pro: 999
      };
    } catch (error) {
      console.error('Error getting card limits:', error);
      return {
        free: 2,
        pro: 999
      };
    }
  }
};

export default userService;
