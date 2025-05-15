
// Simple in-memory card storage
interface Card {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  organization?: string;
  slug: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  themeColor?: string;
  profileImage?: string;
  website?: string;
  theme?: string;
  notes?: string;
  photo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

let cards: Card[] = [];
let nextId = 1;

/**
 * Generate a simple slug from first name and last name
 */
const generateSlug = (firstName: string, lastName: string): string => {
  const base = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
  const timestamp = Date.now().toString(36).substring(4);
  return `${base}-${timestamp}`;
};

/**
 * Card service for handling card data in memory
 */
export const simpleCardService = {
  /**
   * Create a new card
   */
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<Card> {
    const id = `card-${nextId++}`;
    const slug = generateSlug(cardData.firstName, cardData.lastName);
    
    const newCard: Card = {
      ...cardData,
      id,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    cards.push(newCard);
    return newCard;
  },
  
  /**
   * Get all cards for a user
   */
  async getUserCards(userId: string): Promise<Card[]> {
    return cards.filter(card => card.userId === userId);
  },
  
  /**
   * Get a card by ID
   */
  async getCardById(id: string): Promise<Card | null> {
    return cards.find(card => card.id === id) || null;
  },
  
  /**
   * Get a card by slug
   */
  async getCardBySlug(slug: string): Promise<Card | null> {
    return cards.find(card => card.slug === slug) || null;
  },
  
  /**
   * Update a card
   */
  async updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
    const index = cards.findIndex(card => card.id === id);
    if (index === -1) return null;
    
    const updatedCard = {
      ...cards[index],
      ...updates,
      updatedAt: new Date()
    };
    
    cards[index] = updatedCard;
    return updatedCard;
  },
    /**
   * Delete a card
   */
  async deleteCard(id: string): Promise<boolean> {
    const initialLength = cards.length;
    cards = cards.filter(card => card.id !== id);
    return cards.length < initialLength;
  },

  /**
   * Toggle a card's active status
   */
  async toggleCardActive(id: string, active: boolean): Promise<Card | null> {
    const card = await this.getCardById(id);
    if (!card) return null;
    
    return this.updateCard(id, { active });
  }
};

// Export default instance
const simpleCardServiceInstance = simpleCardService;
export default simpleCardServiceInstance;

export default simpleCardService;
