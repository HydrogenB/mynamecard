/**
 * API facade optimized for Firebase Free Plan
 * Uses directFirestoreService instead of Cloud Functions
 */
import { Card } from '../db/db';
import { directFirestoreService } from './directFirestoreService';

export class CardAPIFreePlan {
  /**
   * Create a new card
   */
  async createCard(cardData: Partial<Card>): Promise<{ id: string; card: Card }> {
    try {
      // Call the direct Firestore service
      return await directFirestoreService.createCard(cardData);
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  }

  /**
   * Get all cards for the current user
   */
  async getUserCards(): Promise<{ id: string; card: Card }[]> {
    try {
      // Call the direct Firestore service
      return await directFirestoreService.getUserCards();
    } catch (error) {
      console.error('Error getting user cards:', error);
      throw error;
    }
  }

  /**
   * Get a card by ID
   */
  async getCardById(cardId: string): Promise<{ id: string; card: Card }> {
    try {
      // Call the direct Firestore service
      return await directFirestoreService.getCardById(cardId);
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw error;
    }
  }

  /**
   * Get a card by slug
   */
  async getCardBySlug(slug: string): Promise<{ id: string; card: Card }> {
    try {
      // Call the direct Firestore service
      return await directFirestoreService.getCardBySlug(slug);
    } catch (error) {
      console.error('Error getting card by slug:', error);
      throw error;
    }
  }

  /**
   * Update a card
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<{ id: string; card: Card }> {
    try {
      // Call the direct Firestore service
      return await directFirestoreService.updateCard(cardId, cardData);
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    try {
      // Call the direct Firestore service
      await directFirestoreService.deleteCard(cardId);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}

/**
 * Create an instance of the API facade
 */
export const cardAPIFreePlan = new CardAPIFreePlan();
