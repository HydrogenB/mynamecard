// Type definitions for the application

export interface CardAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Card {
  id?: string;
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
  socialMedia?: SocialMedia;
}

// Simple in-memory database helpers
export const db = {
  // Just a placeholder for type compatibility - actual logic is in service files
  getCollection: (collectionName: string) => {
    console.log(`Mock getting collection: ${collectionName}`);
    return [];
  }
};
