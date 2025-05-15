// This service is now a wrapper that delegates to cardAPI.ts
// It exists only for backward compatibility with components still using the old interface
import cardAPI from './cardAPI';
import { Card } from '../db/db';

export const cardService = {
  async getCardById(cardId: string) {
    return await cardAPI.getCardById(cardId);
  },
  
  async getUserCards(userId: string) {
    return await cardAPI.getUserCards(userId); 
  },
  
  async getCardBySlug(slug: string) {
    return await cardAPI.getCardBySlug(slug);
  },
  
  async updateCard(cardId: string, updates: Partial<Card>) {
    return await cardAPI.updateCard(cardId, updates);
  },
  
  async deleteCard(cardId: string) {
    return await cardAPI.deleteCard(cardId);
  },
  
  async toggleCardActive(cardId: string, active: boolean) {
    return await cardAPI.toggleCardActive(cardId, active);
  }
};