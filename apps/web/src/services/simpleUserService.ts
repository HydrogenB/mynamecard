
import { simpleAuthService } from './simpleAuthService';

interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  plan: 'free' | 'pro';
  cardLimit: number;
  cardsCreated: number;
  createdAt: Date;
  updatedAt: Date;
  lastSeen?: Date;
}

// Simple in-memory user profile storage
const userProfiles: Record<string, UserData> = {};

// Default card limit
const DEFAULT_CARD_LIMIT = 2;

/**
 * User service for handling user data in memory
 */
export const simpleUserService = {
  /**
   * Create a user profile after registration
   */
  async createUserProfile(user: any): Promise<UserData> {
    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      plan: 'free' as const,
      cardLimit: DEFAULT_CARD_LIMIT,
      cardsCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date()
    };
    
    userProfiles[user.uid] = userData;
    return userData;
  },
  
  /**
   * Get user data
   */
  async getUserProfile(uid: string): Promise<UserData | null> {
    return userProfiles[uid] || null;
  },
  
  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserData>): Promise<boolean> {
    try {
      const profile = userProfiles[uid];
      if (!profile) return false;
      
      userProfiles[uid] = {
        ...profile,
        ...updates,
        updatedAt: new Date()
      };
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },
    
  /**
   * Check if user can create more cards
   */
  async canCreateCard(uid: string): Promise<boolean> {
    const profile = userProfiles[uid];
    if (!profile) return false;
    
    return profile.cardsCreated < profile.cardLimit;
  },
  
  /**
   * Increment the number of cards created by user
   */
  async incrementCardsCreated(uid: string): Promise<boolean> {
    const profile = userProfiles[uid];
    if (!profile) return false;
    
    userProfiles[uid] = {
      ...profile,
      cardsCreated: profile.cardsCreated + 1,
      updatedAt: new Date()
    };
    return true;
  }
};

// Export default instance
const simpleUserServiceInstance = simpleUserService;
export default simpleUserServiceInstance;
