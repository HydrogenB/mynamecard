import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

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

// Helper to convert Firestore data to our Card type
const convertFirestoreCardData = (id: string, data: any): Card => {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
  };
};

class FirestoreDB {
  private cardsCollection = collection(firestore, 'cards');
  
  async getCardBySlug(slug: string): Promise<Card | undefined> {
    const q = query(this.cardsCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return undefined;
    }
    
    const doc = querySnapshot.docs[0];
    return convertFirestoreCardData(doc.id, doc.data());
  }
  
  async getCardById(id: string): Promise<Card | undefined> {
    const docRef = doc(this.cardsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return undefined;
    }
    
    return convertFirestoreCardData(docSnap.id, docSnap.data());
  }
  
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.cardsCollection, {
      ...card,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  }
  
  async updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<string> {
    const docRef = doc(this.cardsCollection, id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return id;
  }
  
  async deleteCard(id: string): Promise<void> {
    const docRef = doc(this.cardsCollection, id);
    await deleteDoc(docRef);
  }
  
  async getAllCards(): Promise<Card[]> {
    const querySnapshot = await getDocs(this.cardsCollection);
    return querySnapshot.docs.map(doc => convertFirestoreCardData(doc.id, doc.data()));
  }
  
  async getUserCards(userId: string): Promise<Card[]> {
    const q = query(this.cardsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertFirestoreCardData(doc.id, doc.data()));
  }
  
  async getCardCount(userId?: string): Promise<number> {
    let queryRef;
    
    if (userId) {
      queryRef = query(this.cardsCollection, where('userId', '==', userId));
    } else {
      queryRef = query(this.cardsCollection);
    }
    
    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.size;
  }
}

export const db = new FirestoreDB();
