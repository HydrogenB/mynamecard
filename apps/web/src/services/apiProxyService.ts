import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { firestore, auth } from '../config/firebase';
import { Card } from '../db/db';
import { generateSlug } from '../schemas/cardSchema';

// Collection names
const CARDS_COLLECTION = 'cards';
const USERS_COLLECTION = 'users';
const CARD_STATS_COLLECTION = 'cardStats';
const SYSTEM_CONFIG_COLLECTION = 'system_config';

/**
 * API Proxy Service - Simulates a backend API but runs in the frontend
 * This is a temporary solution until the project is upgraded to the Blaze plan
 * to use Firebase Cloud Functions
 */
const apiProxyService = {
  /**
   * Create a card with proper error handling and permission checks
   */
  async createCard(cardData: any): Promise<{cardId: string; slug: string}> {
    // Check authentication
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    
    const userId = auth.currentUser.uid;
    
    try {
      console.log('Creating card via API proxy service');
      
      // First ensure user profile exists
      const userRef = doc(firestore, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      // Create user profile if it doesn't exist
      if (!userDoc.exists()) {
        console.log('Creating user profile first');
        await setDoc(userRef, {
          uid: userId,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || '',
          photoURL: auth.currentUser.photoURL || '',
          plan: 'free',
          cardLimit: 2, // Default free plan limit
          cardsCreated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Force a token refresh to update security rules
        await auth.currentUser.getIdToken(true);
      }
      
      // Check card limits
      const userData = userDoc.exists() ? userDoc.data() : { cardsCreated: 0 };
      
      // Get limit from system config
      let cardLimit = 2; // Default
      const limitsRef = doc(firestore, SYSTEM_CONFIG_COLLECTION, 'card_limits');
      const limitsDoc = await getDoc(limitsRef);
      
      if (limitsDoc.exists()) {
        const limits = limitsDoc.data();
        const userPlan = userData.plan || 'free';
        cardLimit = limits[userPlan] || 2;
      } else {
        // Create default limits if they don't exist
        await setDoc(limitsRef, {
          free: 2,
          pro: 999,
          updatedAt: serverTimestamp()
        });
      }
      
      // Check if user has reached their limit
      if (userData.cardsCreated >= cardLimit) {
        throw new Error('Card limit reached. Please upgrade your plan to create more cards.');
      }
      
      // Generate a unique slug if not provided
      let slug = cardData.slug;
      if (!slug && cardData.firstName && cardData.lastName) {
        slug = generateSlug(cardData.firstName, cardData.lastName);
      }
      
      // Check if slug exists
      const slugQuery = query(
        collection(firestore, CARDS_COLLECTION),
        where('slug', '==', slug)
      );
      
      const slugDocs = await getDocs(slugQuery);
      if (!slugDocs.empty) {
        // Add a random number to make it unique
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
      
      // Prepare card data
      const processedCardData = {
        ...cardData,
        slug,
        userId,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Create card document
      const cardRef = doc(collection(firestore, CARDS_COLLECTION));
      await setDoc(cardRef, processedCardData);
      
      // Update user's card count
      await setDoc(userRef, {
        cardsCreated: (userData.cardsCreated || 0) + 1,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Create card stats
      await setDoc(doc(firestore, CARD_STATS_COLLECTION, cardRef.id), {
        views: 0,
        downloads: 0,
        shares: 0,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        cardId: cardRef.id,
        slug
      };    } catch (error: any) {
      console.error('Error in API proxy card creation:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }
  },

  /**
   * Get a card by ID
   */
  async getCardById(cardId: string): Promise<Card | null> {
    // Check authentication
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    
    try {
      const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        return null;
      }
      
      return {
        id: cardDoc.id,
        ...cardDoc.data() as Omit<Card, 'id'>
      };
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw new Error(`Failed to get card: ${error}`);
    }
  },
  
  /**
   * Get a card by slug
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    try {
      const cardsQuery = query(
        collection(firestore, CARDS_COLLECTION),
        where('slug', '==', slug)
      );
      
      const querySnapshot = await getDocs(cardsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const cardDoc = querySnapshot.docs[0];
      
      return {
        id: cardDoc.id,
        ...cardDoc.data() as Omit<Card, 'id'>
      };
    } catch (error) {
      console.error('Error getting card by slug:', error);
      throw new Error(`Failed to get card by slug: ${error}`);
    }
  },
  
  /**
   * Get all cards for a user
   */
  async getUserCards(userId: string): Promise<Card[]> {
    // Check authentication
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    
    try {
      const cardsQuery = query(
        collection(firestore, CARDS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(cardsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Card, 'id'>
      }));
    } catch (error) {
      console.error('Error getting user cards:', error);
      throw new Error(`Failed to get user cards: ${error}`);
    }
  },
  
  /**
   * Update a card
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<void> {
    // Check authentication
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    
    try {
      const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }
      
      // Check ownership
      const card = cardDoc.data();
      if (card.userId !== auth.currentUser.uid) {
        throw new Error('You do not have permission to update this card');
      }
      
      // Update the card
      await setDoc(cardRef, {
        ...cardData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error(`Failed to update card: ${error}`);
    }
  },
  
  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    // Check authentication
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    
    try {
      const cardRef = doc(firestore, CARDS_COLLECTION, cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }
      
      // Check ownership
      const card = cardDoc.data();
      if (card.userId !== auth.currentUser.uid) {
        throw new Error('You do not have permission to delete this card');
      }
      
      // Delete the card
      await setDoc(cardRef, {
        active: false,
        deleted: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error}`);
    }
  }
};

export default apiProxyService;
