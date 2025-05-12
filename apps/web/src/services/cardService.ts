import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment,
  // runTransaction removed as it's unused
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Card } from '../db/db';
import { generateSlug } from '../schemas/cardSchema';

// Collection names
const CARDS_COLLECTION = 'cards';
const CARD_LOGS_COLLECTION = 'card_logs';
const CARD_STATS_COLLECTION = 'card_stats';
const USERS_COLLECTION = 'users';
const SYSTEM_CONFIG_COLLECTION = 'system_config';

/**
 * Card Service - Handles all card-related operations with Firestore
 */
export const cardService = {
  /**
   * Create a new card
   */
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<{ cardId: string }> {
    // Get user first to check limits
    const userRef = doc(firestore, USERS_COLLECTION, cardData.userId || '');
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    // Fetch card limits configuration
    const limitsRef = doc(firestore, SYSTEM_CONFIG_COLLECTION, 'card_limits');
    const limitsDoc = await getDoc(limitsRef);
    
    if (!limitsDoc.exists()) {
      throw new Error('System configuration not found');
    }
    
    const limits = limitsDoc.data();
    const userPlan = userData.plan || 'free';
    const cardLimit = limits[userPlan] || 2; // Default to free plan limit
    
    // Check if user has reached their card limit
    const cardsCreated = userData.cardsCreated || 0;
    
    if (cardsCreated >= cardLimit) {
      throw new Error('Card limit reached');
    }
    
    // Check if slug is provided or generate one
    const slug = cardData.slug || generateSlug(cardData.firstName, cardData.lastName);
    
    // Check if slug is unique
    const slugQuery = query(
      collection(firestore, CARDS_COLLECTION),
      where('slug', '==', slug)
    );
    const slugQuerySnapshot = await getDocs(slugQuery);
    
    if (!slugQuerySnapshot.empty) {
      throw new Error('Slug already exists');
    }
    
    // Create card
    const cardRef = doc(collection(firestore, CARDS_COLLECTION));
    const newCard = {
      ...cardData,
      slug,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(cardRef, newCard);
    
    // Update user's card count
    await updateDoc(userRef, {
      cardsCreated: increment(1),
      lastActivity: serverTimestamp()
    });
    
    // Initialize card stats
    const statsRef = doc(firestore, CARD_STATS_COLLECTION, cardRef.id);
    await setDoc(statsRef, {
      views: 0,
      downloads: 0,
      shares: 0,
      lastViewed: null,
      cardId: cardRef.id
    });
    
    return { cardId: cardRef.id };
  },
  
  /**
   * Update an existing card
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<void> {
    const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      throw new Error('Card not found');
    }
    
    // If slug is being updated, check if it's unique
    if (cardData.slug && cardData.slug !== cardDoc.data().slug) {
      const slugQuery = query(
        collection(firestore, CARDS_COLLECTION),
        where('slug', '==', cardData.slug)
      );
      const slugQuerySnapshot = await getDocs(slugQuery);
      
      if (!slugQuerySnapshot.empty) {
        throw new Error('Slug already exists');
      }
    }
    
    await updateDoc(cardRef, {
      ...cardData,
      updatedAt: serverTimestamp()
    });
    
    // Update user's last activity
    if (cardDoc.data().userId) {
      await updateDoc(doc(firestore, USERS_COLLECTION, cardDoc.data().userId), {
        lastActivity: serverTimestamp()
      });
    }
  },
  
  /**
   * Get card by ID
   */
  async getCardById(cardId: string): Promise<Card | null> {
    const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      return null;
    }
    
    const cardData = cardDoc.data() as Card;
    return { ...cardData, id: cardId };
  },
  
  /**
   * Get card by slug
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    const cardsQuery = query(
      collection(firestore, CARDS_COLLECTION),
      where('slug', '==', slug),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(cardsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const cardDoc = querySnapshot.docs[0];
    const cardData = cardDoc.data() as Card;
    return { ...cardData, id: cardDoc.id };
  },
  
  /**
   * Get user's cards
   */
  async getUserCards(userId: string): Promise<Card[]> {
    const cardsQuery = query(
      collection(firestore, CARDS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(cardsQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Card));
  },
  
  /**
   * Log card activity (view, download, share)
   */
  async logCardActivity(cardId: string, activity: {
    type: 'view' | 'download' | 'share';
    uid?: string;
  }): Promise<void> {
    const logRef = collection(firestore, CARD_LOGS_COLLECTION);
    
    await addDoc(logRef, {
      cardId,
      type: activity.type,
      uid: activity.uid || null,
      timestamp: serverTimestamp()
    });
    
    // Update stats counters
    const statsRef = doc(firestore, CARD_STATS_COLLECTION, cardId);
    
    await updateDoc(statsRef, {
      [activity.type + 's']: increment(1),
      ...(activity.type === 'view' ? { lastViewed: serverTimestamp() } : {})
    });
  },
  
  /**
   * Get card statistics
   */
  async getCardStats(cardId: string): Promise<{
    views: number;
    downloads: number;
    shares: number;
    lastViewed: Date | null;
  }> {
    const statsRef = doc(firestore, CARD_STATS_COLLECTION, cardId);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      return {
        views: 0,
        downloads: 0,
        shares: 0,
        lastViewed: null
      };
    }
    
    const data = statsDoc.data();
    
    return {
      views: data.views || 0,
      downloads: data.downloads || 0,
      shares: data.shares || 0,
      lastViewed: data.lastViewed ? new Date(data.lastViewed.toDate()) : null
    };
  },
  
  /**
   * Track user's last seen timestamp
   */
  async updateUserLastSeen(userId: string): Promise<void> {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      lastSeen: serverTimestamp()
    });
  },
  
  /**
   * Get user's card limits and usage
   */
  async getUserCardLimits(userId: string): Promise<{
    plan: string;
    cardsCreated: number;
    cardLimit: number;
    cardsRemaining: number;
  }> {
    // Get user data
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const userPlan = userData.plan || 'free';
    
    // Get system card limits
    const limitsRef = doc(firestore, SYSTEM_CONFIG_COLLECTION, 'card_limits');
    const limitsDoc = await getDoc(limitsRef);
    
    if (!limitsDoc.exists()) {
      throw new Error('System configuration not found');
    }
    
    const limits = limitsDoc.data();
    const cardLimit = limits[userPlan] || 2; // Default to free plan limit
    const cardsCreated = userData.cardsCreated || 0;
    
    return {
      plan: userPlan,
      cardsCreated,
      cardLimit,
      cardsRemaining: Math.max(0, cardLimit - cardsCreated)
    };
  },

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      throw new Error('Card not found');
    }
    
    // Get the user ID before deleting
    const userId = cardDoc.data().userId;
    
    // Delete the card
    await deleteDoc(cardRef);
    
    // Delete associated stats
    try {
      await deleteDoc(doc(firestore, CARD_STATS_COLLECTION, cardId));
    } catch (error) {
      console.warn('Could not delete card stats:', error);
    }
    
    // Update user's cards count if userId exists
    if (userId) {
      const userRef = doc(firestore, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCount = userData.cardsCreated || 0;
        
        await updateDoc(userRef, {
          cardsCreated: Math.max(0, currentCount - 1),
          updatedAt: serverTimestamp()
        });
      }
    }
  },
  
  /**
   * Toggle card active status
   */
  async toggleCardActive(cardId: string, active: boolean): Promise<void> {
    const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
    
    await updateDoc(cardRef, {
      active,
      updatedAt: serverTimestamp()
    });
  }
};
