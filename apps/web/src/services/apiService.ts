import { getFunctions, httpsCallable } from 'firebase/functions';
import { firestore } from '../config/firebase';
import { Card } from '../db/db';
import { doc, getDoc } from 'firebase/firestore';

// Instantiate Firebase Functions
const functions = getFunctions();

/**
 * API service for making calls to backend Cloud Functions
 * This service centralizes all API calls to the backend
 */
export const apiService = {
  /**
   * Creates a new card by calling the backend API
   * @param cardData The card data to create
   * @returns A promise resolving to the created card ID and slug
   */
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<{cardId: string, slug: string}> {
    try {
      console.log('Creating card via backend API...');
      
      // Call the createCard Cloud Function
      const createCardFunction = httpsCallable(functions, 'createCard');
      
      // Call the function with card data
      const result = await createCardFunction(cardData);
      const data = result.data as { success: boolean; cardId: string; slug: string; };
      
      if (!data.success) {
        throw new Error('Card creation failed on the server');
      }
      
      console.log('Card created successfully via API:', data.cardId);
      return {
        cardId: data.cardId,
        slug: data.slug
      };
    } catch (error) {
      console.error('Error calling createCard API:', error);
      throw error;
    }
  },
  
  /**
   * Gets a card by ID
   * @param cardId The card ID to fetch
   * @returns A promise resolving to the card or null if not found
   */
  async getCardById(cardId: string): Promise<Card | null> {
    try {
      // For now, we'll still read directly from Firestore
      // This is fine since read permissions are less restrictive
      const cardRef = doc(firestore, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        return null;
      }
      
      const data = cardDoc.data();
      return {
        ...data,
        id: cardId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Card;
    } catch (error) {
      console.error('Error fetching card by ID:', error);
      throw error; 
    }
  },
  
  /**
   * Updates an existing card
   * This would typically call another Cloud Function
   * For now it's a placeholder that returns a promise
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<boolean> {
    // This would call an updateCard Cloud Function
    // For now it's a placeholder
    console.log('Update card API would be called here with:', {cardId, cardData});
    return Promise.resolve(true);
  },
  
  /**
   * Deletes a card
   * This would typically call another Cloud Function 
   * For now it's a placeholder that returns a promise
   */
  async deleteCard(cardId: string): Promise<boolean> {
    // This would call a deleteCard Cloud Function
    // For now it's a placeholder
    console.log('Delete card API would be called here with:', {cardId});
    return Promise.resolve(true);
  }
};

export default apiService;
