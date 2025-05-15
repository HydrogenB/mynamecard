import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../config/firebase';

// Initialize Firebase Functions
const functions = getFunctions();

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
    }
  }
};

export default cloudFunctionsService;
