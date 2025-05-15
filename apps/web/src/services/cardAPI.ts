import { Card } from '../db/db';
import { simpleCardService } from './simpleCardService';
import { simpleUserService } from './simpleUserService';
import { simpleAuthService } from './simpleAuthService';

/**
 * Card API Service - Acts as a facade between components and card-related services
 * Uses simpleCardService and simpleUserService for in-memory data management
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
      const currentUser = simpleAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required to create a card');
      }
      
      // Check if user can create more cards
      const canCreate = await simpleUserService.canCreateCard(currentUser.uid);
      if (!canCreate) {
        throw new Error('Card limit reached. Upgrade your plan to create more cards.');
      }
      
      // Ensure user ID is set
      cardData.userId = currentUser.uid;
      
      // Create the card
      const card = await simpleCardService.createCard({
        ...cardData,
        active: true // Cards are active by default
      });
      
      // Increment the user's card count
      await simpleUserService.incrementCardsCreated(currentUser.uid);
      
      return { cardId: card.id, slug: card.slug };
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
      return await simpleCardService.getCardById(cardId);
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
      return await simpleCardService.getCardBySlug(slug);
    } catch (error: any) {
      console.error('Error getting card by slug:', error);
      return null;
    }
  },  /**
   * Get all cards for a user
   * @param userId The ID of the user
   * @returns A promise with an array of cards
   */  async getUserCards(userId: string): Promise<Card[]> {
    try {
      // Log the user ID for debugging purposes
      console.log(`Fetching cards for user ${userId}`);
      
      return await simpleCardService.getUserCards(userId);
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
      const currentUser = simpleAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required to update a card');
      }
      
      // Verify card ownership
      const card = await simpleCardService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }
      
      if (card.userId !== currentUser.uid) {
        throw new Error('You do not have permission to update this card');
      }
      
      console.log(`Updating card ID ${cardId} with data:`, cardData);
      await simpleCardService.updateCard(cardId, cardData);
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
   */  async toggleCardActive(cardId: string, active: boolean): Promise<void> {
    try {
      const currentUser = simpleAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required to update a card');
      }
      
      // Verify card ownership
      const card = await simpleCardService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }
      
      if (card.userId !== currentUser.uid) {
        throw new Error('You do not have permission to update this card');
      }
      
      await simpleCardService.updateCard(cardId, { active });
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
      const currentUser = simpleAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required to delete a card');
      }
      
      // Verify card ownership
      const card = await simpleCardService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }
      
      if (card.userId !== currentUser.uid) {
        throw new Error('You do not have permission to delete this card');
      }
      
      console.log(`Deleting card with ID: ${cardId}`);
      await simpleCardService.deleteCard(cardId);
      
      // Decrement the user's card count
      const userProfile = await simpleUserService.getUserProfile(currentUser.uid);
      if (userProfile) {
        await simpleUserService.updateUserProfile(currentUser.uid, {
          cardsCreated: Math.max(0, userProfile.cardsCreated - 1)
        });
      }
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }
  }
};

export default cardAPI;
