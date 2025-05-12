import Dexie, { Table } from 'dexie';

export interface CardAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Card {
  id?: string | number;
  slug: string;
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: CardAddress;
  photo?: string;
  notes?: string;
  theme?: string;
  userId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NameCardDB extends Dexie {
  cards!: Table<Card, number>;
  
  constructor() {
    super('NameCardDB');
    this.version(1).stores({
      cards: '++id, slug'
    });
  }
    async getCardBySlug(slug: string): Promise<Card | undefined> {
    return this.cards.where('slug').equals(slug).first();
  }
  
  async getCardById(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }
  
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return this.cards.add({
      ...card,
      createdAt: now,
      updatedAt: now
    });
  }
  
  async updateCard(id: number, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number> {
    return this.cards.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  }
  
  async deleteCard(id: number): Promise<void> {
    await this.cards.delete(id);
  }
  
  async getAllCards(): Promise<Card[]> {
    return this.cards.toArray();
  }
  
  async getCardCount(): Promise<number> {
    return this.cards.count();
  }
}

export const db = new NameCardDB();

// For localStorage fallback
export const syncToLocalStorage = async (): Promise<void> => {
  try {
    const cards = await db.getAllCards();
    localStorage.setItem('namecard_backup', JSON.stringify(cards));
  } catch (error) {
    console.error('Failed to sync to localStorage', error);
  }
};

export const loadFromLocalStorage = async (): Promise<void> => {
  try {
    const backup = localStorage.getItem('namecard_backup');
    if (backup) {
      const cards = JSON.parse(backup) as Card[];
      await Promise.all(cards.map(card => {
        // Convert string dates back to Date objects
        card.createdAt = new Date(card.createdAt);
        card.updatedAt = new Date(card.updatedAt);
        return db.cards.put(card);
      }));
    }
  } catch (error) {
    console.error('Failed to load from localStorage', error);
  }
};
