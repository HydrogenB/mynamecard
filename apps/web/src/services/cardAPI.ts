import { auth } from '../config/firebase';
import { Card } from '../db/db';

/**
 * Card API Service - Acts as a facade between components and card-related services
 * Uses apiProxyService in development and will use cloudFunctionsService in production
 */
const cardAPI = {
  /**
   * Create a new card
   * @param cardData The card data to create
   * @returns A promise with the card ID and slug
   */
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<{ cardId: string; slug: string }> {
    try {
      // Verify user is authenticated
      if (!auth.currentUser) {
        throw new Error('Authentication required to create a card');
      }
      
      // Ensure user ID is set
      cardData.userId = auth.currentUser.uid;
      
      // Import the API proxy service (development mode)
      // This will be replaced with cloudFunctionsService in production
      const { default: apiProxyService } = await import('./apiProxyService');
      
      // Use the API proxy service to create card
      console.log('Creating card via API');
      const result = await apiProxyService.createCard(cardData);
      
      return result;
    } catch (error: any) {
      console.error('Error creating card:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }
  },
  
  /**
   * Get a card by ID
   * @param cardId The ID of the card to get
   * @returns A promise with the card or null
   */  async getCardById(cardId: string): Promise<Card | null> {
    try {
      // Import the API proxy service
      const { default: apiProxyService } = await import('./apiProxyService');
      return await apiProxyService.getCardById(cardId);
    } catch (error: any) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  },
  
  /**
   * Get a card by slug
   * @param slug The slug of the card to get
   * @returns A promise with the card or null
   */  async getCardBySlug(slug: string): Promise<Card | null> {
    try {
      // Import the API proxy service
      const { default: apiProxyService } = await import('./apiProxyService');
      return await apiProxyService.getCardBySlug(slug);
    } catch (error: any) {
      console.error('Error getting card by slug:', error);
      return null;
    }
  },
  /**
   * Get all cards for a user
   * @param userId The ID of the user
   * @returns A promise with an array of cards
   */
  async getUserCards(userId: string): Promise<Card[]> {
    try {      // Import the API proxy service
      const { default: apiProxyService } = await import('./apiProxyService');
      
      // Log the user ID for debugging purposes
      console.log(`Fetching cards for user ${userId}`);
      
      return await apiProxyService.getUserCards(userId);
    } catch (error: any) {
      console.error('Error getting user cards:', error);
      return [];
    }
  },
  
  /**
   * Update a card
   * @param cardId The ID of the card to update
   * @param cardData The card data to update
   * @returns A promise that resolves when the card is updated
   */  async updateCard(cardId: string, cardData: Partial<Card>): Promise<void> {
    try {
      // Import the API proxy service
      const { default: apiProxyService } = await import('./apiProxyService');
      console.log(`Updating card ID ${cardId} with data:`, cardData);
      await apiProxyService.updateCard(cardId, cardData);
    } catch (error: any) {
      console.error('Error updating card:', error);
      throw new Error(`Failed to update card: ${error.message}`);
    }
  },
  
  /**
   * Toggle a card's active status
   * @param cardId The ID of the card to toggle
   * @param active The new active status
   * @returns A promise that resolves when the card active status is toggled
   */
  async toggleCardActive(cardId: string, active: boolean): Promise<void> {
    try {
      // For now, just update the card with the new active status
      await this.updateCard(cardId, { active });
    } catch (error: any) {
      console.error('Error toggling card active status:', error);
      throw new Error(`Failed to toggle card active status: ${error.message}`);
    }
  },
  
  /**
   * Delete a card
   * @param cardId The ID of the card to delete
   * @returns A promise that resolves when the card is deleted
   */  async deleteCard(cardId: string): Promise<void> {
    try {
      // Import the API proxy service
      const { default: apiProxyService } = await import('./apiProxyService');
      console.log(`Deleting card with ID: ${cardId}`);
      await apiProxyService.deleteCard(cardId);
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }
  }
};

export default cardAPI;
