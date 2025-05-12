// Database service using Firebase Firestore directly
import { Card } from '../db/db';
import { auth } from '../config/firebase';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  // deleteDoc removed as it's unused
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  limit,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION_NAME = 'cards';

// Helper function to convert Firestore Timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const result = { ...data };
  
  // Convert Firestore Timestamp objects to JavaScript Date objects
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  
  return result;
};

// Helper function to check if a slug is unique
const isSlugUnique = async (slug: string, excludeId?: string): Promise<boolean> => {
  const q = query(collection(firestore, COLLECTION_NAME), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return true;
  }
  
  // If we're checking for an update operation, exclude the current card
  if (excludeId) {
    return querySnapshot.docs.every(doc => doc.id !== excludeId);
  }
  
  return false;
};

/**
 * Database service for handling Firestore operations
 */
export const databaseService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },  /**
   * Create a card with card limit validation
   */
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Card> {
    const user = this.getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create cards');
    }
      try {
      // First check if user profile exists outside of transaction
      // Creating it if necessary to avoid transaction permission issues
      const userRef = doc(firestore, 'users', user.uid);
      const profileDoc = await getDoc(userRef);
      
      if (!profileDoc.exists()) {
        console.log('Creating user profile before transaction');
        // Create a default user profile outside the transaction
        const defaultUserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          plan: 'free',
          cardLimit: 2, // Default limit of 2 cards
          cardsCreated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        try {
          await setDoc(userRef, defaultUserData);
          console.log('User profile created successfully');
          
          // Wait longer to ensure Firestore has time to process the profile creation
          // and propagate to the security rules - 2 seconds should be enough
          console.log('Waiting for Firestore security rules propagation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('Proceeding with card creation after delay');
        } catch (profileError: any) {
          console.error('Error creating user profile:', profileError);
          throw new Error(`Failed to create user profile: ${profileError.message || ''}`);
        }
      }
      
      // Run in a transaction to ensure card limit is enforced
      return await runTransaction(firestore, async (transaction) => {
        // Get user profile to check card limit
        const userDoc = await transaction.get(userRef);
        
        let cardCount = 0;
        let cardLimit = 2;
        
        if (!userDoc.exists()) {
          console.error('User profile still not found in transaction, despite creation attempt');
          throw new Error('User profile could not be created. Please try logging out and back in.');
        } else {
          // User profile exists, get the data
          const userData = userDoc.data();
          cardCount = userData.cardsCreated || 0;
          cardLimit = userData.cardLimit || 2;
        }
        
        // Check if user has reached their card limit
        if (cardCount >= cardLimit) {
          throw new Error(`You have reached your maximum limit of ${cardLimit} cards. Please upgrade your plan or delete existing cards.`);
        }
        
        // Check if slug is unique
        const slugQuery = query(collection(firestore, COLLECTION_NAME), where('slug', '==', card.slug));
        const slugDocs = await getDocs(slugQuery);
        
        if (!slugDocs.empty) {
          throw new Error('Card slug already exists. Please choose a different slug.');
        }
        
        // Create a new document reference
        const docRef = doc(collection(firestore, COLLECTION_NAME));
        
        // Prepare card data with timestamps, user ID, and default active state
        const newCard = {
          ...card,
          userId: user.uid,
          active: true, // Cards are active by default
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Write to Firestore within the transaction
        transaction.set(docRef, newCard);
        
        // Increment the user's card count within the same transaction
        transaction.update(userRef, {
          cardsCreated: cardCount + 1,
          updatedAt: serverTimestamp()
        });
        
        // Return the card with ID
        return {
          ...card,
          id: docRef.id,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.uid
        } as Card;
      });
    } catch (error: any) {
      console.error('Error creating card:', error);
      throw error;    }
  },

  /**
   * Get a card by slug
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    const q = query(collection(firestore, COLLECTION_NAME), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    const cardData = convertTimestamps(docData);
    
    return {
      ...cardData,
      id: querySnapshot.docs[0].id
    } as Card;
  },

  /**
   * Get a card by ID
   */
  async getCard(id: string | number): Promise<Card | null> {
    // Convert number id to string if necessary
    const cardId = typeof id === 'number' ? id.toString() : id;
    
    const docRef = doc(firestore, COLLECTION_NAME, cardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const cardData = convertTimestamps(docSnap.data());
    
    return {
      ...cardData,
      id: docSnap.id
    } as Card;
  },

  /**
   * Update a card
   */
  async updateCard(id: string | number, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const user = this.getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update cards');
    }
    
    // Convert number id to string if necessary
    const cardId = typeof id === 'number' ? id.toString() : id;
    
    // Get the card to check ownership
    const docRef = doc(firestore, COLLECTION_NAME, cardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return false;
    }
    
    // Check if user owns this card
    const cardData = docSnap.data();
    if (cardData.userId !== user.uid) {
      throw new Error('You do not have permission to update this card');
    }
    
    // If slug is being updated, check if it's unique
    if (updates.slug && updates.slug !== cardData.slug) {
      const isUnique = await isSlugUnique(updates.slug, cardId);
      if (!isUnique) {
        throw new Error('Card slug already exists');
      }
    }
    
    // Prepare updates with timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Update in Firestore
    await updateDoc(docRef, updatesWithTimestamp);
    
    return true;
  },

  /**
   * Toggle card active status
   */
  async toggleCardActive(id: string | number, active: boolean): Promise<boolean> {
    const user = this.getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update cards');
    }
    
    // Convert number id to string if necessary
    const cardId = typeof id === 'number' ? id.toString() : id;
    
    // Get the card to check ownership
    const docRef = doc(firestore, COLLECTION_NAME, cardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return false;
    }
    
    // Check if user owns this card
    const cardData = docSnap.data();
    if (cardData.userId !== user.uid) {
      throw new Error('You do not have permission to update this card');
    }
    
    // Update active status in Firestore
    await updateDoc(docRef, {
      active: active,
      updatedAt: serverTimestamp()
    });
    
    return true;
  },
  /**
   * Delete a card with transaction safety
   */
  async deleteCard(id: string | number): Promise<boolean> {
    const user = this.getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete cards');
    }
    
    try {
      // Convert number id to string if necessary
      const cardId = typeof id === 'number' ? id.toString() : id;
      
      return await runTransaction(firestore, async (transaction) => {
        // Get the card to check ownership
        const cardRef = doc(firestore, COLLECTION_NAME, cardId);
        const cardDoc = await transaction.get(cardRef);
        
        if (!cardDoc.exists()) {
          throw new Error('Card not found');
        }
        
        // Check if user owns this card
        const cardData = cardDoc.data();
        if (cardData.userId !== user.uid) {
          throw new Error('You do not have permission to delete this card');
        }
        
        // Get user profile to update card count
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }
        
        const userData = userDoc.data();
        const cardCount = userData.cardsCreated || 0;
        
        // Delete card from Firestore within transaction
        transaction.delete(cardRef);
        
        // Decrement the user's card count within the same transaction
        transaction.update(userRef, {
          cardsCreated: Math.max(0, cardCount - 1), // Ensure we don't go below 0
          updatedAt: serverTimestamp()
        });
        
        return true;
      });
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  /**
   * Get all cards for current user
   */
  async getAllCards(): Promise<Card[]> {
    const user = this.getCurrentUser();
    
    if (!user) {
      return [];
    }
    
    // Query cards owned by current user
    const q = query(
      collection(firestore, COLLECTION_NAME), 
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const cards: Card[] = [];
    
    querySnapshot.forEach(doc => {
      const cardData = convertTimestamps(doc.data());
      cards.push({
        ...cardData,
        id: doc.id
      } as Card);
    });
    
    return cards;
  },

  /**
   * Get card count for current user
   */
  async getCardCount(): Promise<number> {
    const user = this.getCurrentUser();
    
    if (!user) {
      return 0;
    }
    
    // Query cards owned by current user
    const q = query(
      collection(firestore, COLLECTION_NAME), 
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },

  /**
   * Get active cards for public access
   * Only retrieves active cards for public viewing
   */
  async getPublicCardBySlug(slug: string): Promise<Card | null> {
    const q = query(
      collection(firestore, COLLECTION_NAME), 
      where('slug', '==', slug),
      where('active', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    const cardData = convertTimestamps(docData);
    
    return {
      ...cardData,
      id: querySnapshot.docs[0].id
    } as Card;
  }
};
