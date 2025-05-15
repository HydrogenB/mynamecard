import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../config/firebase';

/**
 * Cloud Functions Service - Handles all interactions with Firebase Cloud Functions
 */
export const cloudFunctionsService = {
  /**
   * Create a new card via the backend API
   * This fixes permission issues by avoiding direct Firestore access from the frontend
   * @param cardData The card data to create
   * @returns Promise with the created card ID and slug
   */
  async createCard(cardData: any): Promise<{ cardId: string; slug: string }> {
    try {
      // Make sure user is authenticated
      if (!auth.currentUser) {
        throw new Error('Authentication required to create a card');
      }
      
      console.log('Calling createCard cloud function with data:', { ...cardData, photo: cardData.photo ? '[photo data]' : 'none' });
      
      // Call the createCard function
      const createCardFn = httpsCallable<any, { success: boolean; cardId: string; slug: string }>(
        functions, 
        'createCard'
      );
      
      const result = await createCardFn(cardData);
      console.log('createCard function result:', result.data);
      
      if (!result.data.success) {
        throw new Error('Card creation failed on the server');
      }
      
      return {
        cardId: result.data.cardId,
        slug: result.data.slug,
      };
    } catch (error: any) {
      console.error('Error calling createCard function:', error);
      
      // Extract the error message from the Firebase Functions error structure
      const errorMessage = error.details?.message || error.message || 'Unknown server error';
      throw new Error(`Failed to create card: ${errorMessage}`);
    }  },

  /**
   * Get a card by ID using Cloud Functions
   * @param cardId The ID of the card to retrieve
   * @returns Promise with the card data or null
   */
  async getCardById(cardId: string): Promise<any | null> {
    try {
      // Call the getCardById function
      const getCardByIdFn = httpsCallable(functions, 'getCardById');
      const result = await getCardByIdFn({ cardId });
      
      return result.data.card || null;
    } catch (error: any) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  },
  
  /**
   * Get a card by slug using Cloud Functions
   * @param slug The slug of the card to retrieve
   * @returns Promise with the card data or null
   */
  async getCardBySlug(slug: string): Promise<any | null> {
    try {
      // Call the getCardBySlug function
      const getCardBySlugFn = httpsCallable(functions, 'getCardBySlug');
      const result = await getCardBySlugFn({ slug });
      
      return result.data.card || null;
    } catch (error: any) {
      console.error('Error getting card by slug:', error);
      return null;
    }
  },
  
  /**
   * Get all cards for a user using Cloud Functions
   * @param userId The ID of the user
   * @returns Promise with an array of cards
   */
  async getUserCards(userId: string): Promise<any[]> {
    try {
      // Call the getUserCards function
      const getUserCardsFn = httpsCallable(functions, 'getUserCards');
      const result = await getUserCardsFn({ userId });
      
      return result.data.cards || [];
    } catch (error: any) {
      console.error('Error getting user cards:', error);
      return [];
    }
  },
  
  /**
   * Update a card using Cloud Functions
   * @param cardId The ID of the card to update
   * @param cardData The card data to update
   * @returns Promise that resolves when the update is complete
   */
  async updateCard(cardId: string, cardData: any): Promise<void> {
    try {
      // Call the updateCard function
      const updateCardFn = httpsCallable(functions, 'updateCard');
      await updateCardFn({ cardId, cardData });
    } catch (error: any) {
      console.error('Error updating card:', error);
      throw new Error(`Failed to update card: ${error.message}`);
    }
  },
  
  /**
   * Toggle a card's active status using Cloud Functions
   * @param cardId The ID of the card to toggle
   * @param active The new active status
   * @returns Promise that resolves when the toggle is complete
   */
  async toggleCardActive(cardId: string, active: boolean): Promise<void> {
    try {
      await this.updateCard(cardId, { active });
    } catch (error: any) {
      console.error('Error toggling card active status:', error);
      throw new Error(`Failed to toggle card active status: ${error.message}`);
    }
  },
  
  /**
   * Delete a card using Cloud Functions
   * @param cardId The ID of the card to delete
   * @returns Promise that resolves when the deletion is complete
   */
  async deleteCard(cardId: string): Promise<void> {
    try {
      // Call the deleteCard function
      const deleteCardFn = httpsCallable(functions, 'deleteCard');
      await deleteCardFn({ cardId });
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }
  }
};

export default cloudFunctionsService;
