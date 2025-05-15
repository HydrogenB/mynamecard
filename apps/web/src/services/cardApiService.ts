import { Card } from '../db/db';
import cloudFunctionsService from './cloudFunctionsService';

/**
 * Card API Service - Acts as a facade to the backend cloud functions API
 * This avoids direct Firestore access to fix permission issues
 */
export const cardApiService = {
  /**
   * Create a new card using the backend API
   */
  async createCard(cardData: any): Promise<{ cardId: string }> {
    try {
      console.log('Creating card via cloud functions API');
      const result = await cloudFunctionsService.createCard(cardData);
      return { cardId: result.cardId };
    } catch (error: any) {
      console.error('Error creating card via cloud functions:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }
  },

  /**
   * Get user's cards using Firestore (will be replaced with API in future)
   */
  async getUserCards(userId: string): Promise<Card[]> {
    // Import original card service to use its methods
    const { cardService } = await import('./cardService');
    return cardService.getUserCards(userId);
  },

  /**
   * Get card by ID using Firestore (will be replaced with API in future)
   */
  async getCardById(cardId: string): Promise<Card | null> {
    // Import original card service to use its methods
    const { cardService } = await import('./cardService');
    return cardService.getCardById(cardId);
  },

  /**
   * Get card by slug using Firestore (will be replaced with API in future)
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    // Import original card service to use its methods
    const { cardService } = await import('./cardService');
    return cardService.getCardBySlug(slug);
  },

  /**
   * Update a card using Firestore (will be replaced with API in future)
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<void> {
    // Import original card service to use its methods
    const { cardService } = await import('./cardService');
    return cardService.updateCard(cardId, cardData);
  },

  /**
   * Delete a card using Firestore (will be replaced with API in future)
   */
  async deleteCard(cardId: string): Promise<void> {
    // Import original card service to use its methods
    const { cardService } = await import('./cardService');
    return cardService.deleteCard(cardId);
  }
};

export default cardApiService;
