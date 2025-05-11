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
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'users';

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
      cardLimit: 1, // Free users can have 1 card
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
  }
};

export default userService;
