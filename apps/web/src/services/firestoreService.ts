import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Card } from '../db/db';

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

export const firestoreService = {
  /**
   * Create a new card in Firestore
   */
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    // Check if slug is unique
    const isUnique = await isSlugUnique(card.slug);
    if (!isUnique) {
      throw new Error('Card slug already exists');
    }
    
    // Create a new document reference
    const docRef = doc(collection(firestore, COLLECTION_NAME));
    
    // Prepare card data with timestamps
    const newCard = {
      ...card,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Write to Firestore
    await setDoc(docRef, newCard);
    
    // Return the card with ID
    return {
      ...card,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  
  /**
   * Get a card by its slug
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    const q = query(collection(firestore, COLLECTION_NAME), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0];
    const data = docData.data();
    
    return {
      ...convertTimestamps(data),
      id: parseInt(docData.id)
    } as Card;
  },
  
  /**
   * Get a card by its ID
   */
  async getCard(id: number): Promise<Card | null> {
    const docRef = doc(firestore, COLLECTION_NAME, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      ...convertTimestamps(docSnap.data()),
      id
    } as Card;
  },
  
  /**
   * Update an existing card
   */
  async updateCard(id: number, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    // If slug is being updated, check if it's unique
    if (updates.slug) {
      const isUnique = await isSlugUnique(updates.slug, id.toString());
      if (!isUnique) {
        throw new Error('Card slug already exists');
      }
    }
    
    const docRef = doc(firestore, COLLECTION_NAME, id.toString());
    
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      return false;
    }
  },
  
  /**
   * Delete a card
   */
  async deleteCard(id: number): Promise<boolean> {
    const docRef = doc(firestore, COLLECTION_NAME, id.toString());
    
    try {
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  },
  
  /**
   * Get all cards for a user
   */
  async getAllCards(userId: string): Promise<Card[]> {
    const q = query(collection(firestore, COLLECTION_NAME), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...convertTimestamps(doc.data()),
      id: parseInt(doc.id)
    } as Card));
  },
  
  /**
   * Count cards for a user
   */
  async getCardCount(userId: string): Promise<number> {
    const q = query(collection(firestore, COLLECTION_NAME), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  },
  
  /**
   * Migrate data from IndexedDB to Firestore
   */
  async migrateFromIndexedDB(cards: Card[], userId: string): Promise<void> {
    // Use a transaction to ensure all operations succeed or fail together
    await runTransaction(firestore, async (transaction) => {
      for (const card of cards) {
        const docRef = doc(collection(firestore, COLLECTION_NAME));
        
        // Add userId to the card data
        const cardData = {
          ...card,
          userId,
          updatedAt: serverTimestamp(),
          createdAt: card.createdAt || serverTimestamp()
        };
        
        // Remove the ID field since Firestore will generate one
        if ('id' in cardData) {
          delete cardData.id;
        }
        
        transaction.set(docRef, cardData);
      }
    });
  }
};

export default firestoreService;
