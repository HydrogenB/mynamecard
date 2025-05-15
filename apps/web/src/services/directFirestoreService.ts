/**
 * DirectFirestoreService - Client-side implementation that works with Firebase Free plan
 * Replaces Cloud Functions API with direct Firestore operations
 */
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  FirestoreError,
  runTransaction,
  setDoc
} from "firebase/firestore";
import { firestore } from "../config/firebase";
import { auth } from "../config/firebase";
import { Card } from "../db/db";
import { generateSlug } from "../utils/slugGenerator";

export class DirectFirestoreService {
  /**
   * Create a new card directly in Firestore
   */
  async createCard(card: Partial<Card>): Promise<{ id: string; card: Card }> {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate a slug if not provided
      if (!card.slug) {
        card.slug = generateSlug(card.firstName || "", card.lastName || "");
      }

      // Get current user data to check card limits
      const userRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      // Check card limit
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cardLimit = userData.cardLimit || 2; // Default limit is 2
        const cardsCreated = userData.cardsCreated || 0;
        
        if (cardsCreated >= cardLimit) {
          throw new Error("Card limit reached");
        }
      }
      
      // Create the card with required fields
      const newCard: Card = {
        ...card as Card,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true
      };
      
      // Use a transaction to create card and update user's card count
      const result = await runTransaction(firestore, async (transaction) => {
        // Add the card
        const cardRef = collection(firestore, "cards");
        const newCardRef = doc(cardRef);
        transaction.set(newCardRef, newCard);
        
        // Update user's card count
        transaction.set(userRef, {
          cardsCreated: increment(1),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        return { id: newCardRef.id, card: newCard };
      });
      
      // Initialize card statistics
      const statsRef = doc(firestore, "cardStats", result.id);
      await setDoc(statsRef, {
        views: 0,
        scans: 0,
        downloads: 0,
        shares: 0,
        cardId: result.id,
        updatedAt: serverTimestamp()
      });
      
      return result;
    } catch (error) {
      console.error("Error creating card:", error);
      throw error;
    }
  }

  /**
   * Get all cards for the current user
   */
  async getUserCards(): Promise<{ id: string; card: Card }[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const cardsRef = collection(firestore, "cards");
      const q = query(cardsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const cards = querySnapshot.docs.map(doc => ({
        id: doc.id,
        card: doc.data() as Card
      }));
      
      return cards;
    } catch (error) {
      console.error("Error getting user cards:", error);
      throw error;
    }
  }

  /**
   * Get a card by ID
   */
  async getCardById(cardId: string): Promise<{ id: string; card: Card }> {
    try {
      const cardRef = doc(firestore, "cards", cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error("Card not found");
      }
      
      const cardData = cardDoc.data() as Card;
      
      // Check if the card is accessible
      const user = auth.currentUser;
      if (!cardData.active && (!user || user.uid !== cardData.userId)) {
        throw new Error("Card not found");
      }
      
      // Track card view if it's not the owner viewing
      if (user?.uid !== cardData.userId) {
        await this.trackCardView(cardId);
      }
      
      return { id: cardDoc.id, card: cardData };
    } catch (error) {
      console.error("Error getting card by ID:", error);
      throw error;
    }
  }

  /**
   * Get a card by slug
   */
  async getCardBySlug(slug: string): Promise<{ id: string; card: Card }> {
    try {
      const cardsRef = collection(firestore, "cards");
      const q = query(cardsRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Card not found");
      }
      
      const cardDoc = querySnapshot.docs[0];
      const cardData = cardDoc.data() as Card;
      
      // Check if the card is accessible
      const user = auth.currentUser;
      if (!cardData.active && (!user || user.uid !== cardData.userId)) {
        throw new Error("Card not found");
      }
      
      // Track card view if it's not the owner viewing
      if (user?.uid !== cardData.userId) {
        await this.trackCardView(cardDoc.id);
      }
      
      return { id: cardDoc.id, card: cardData };
    } catch (error) {
      console.error("Error getting card by slug:", error);
      throw error;
    }
  }

  /**
   * Update a card
   */
  async updateCard(cardId: string, updatedCard: Partial<Card>): Promise<{ id: string; card: Card }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const cardRef = doc(firestore, "cards", cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error("Card not found");
      }
      
      const cardData = cardDoc.data() as Card;
      
      // Check if user owns this card
      if (cardData.userId !== user.uid) {
        throw new Error("Not authorized to update this card");
      }
      
      // Prepare update data
      const updateData = {
        ...updatedCard,
        updatedAt: serverTimestamp()
      };
      
      // Don't allow changing userId
      delete updateData.userId;
      
      // Update the card
      await updateDoc(cardRef, updateData);
      
      // Get the updated card
      const updatedCardDoc = await getDoc(cardRef);
      const updatedCardData = updatedCardDoc.data() as Card;
      
      return { id: cardId, card: updatedCardData };
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const cardRef = doc(firestore, "cards", cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error("Card not found");
      }
      
      const cardData = cardDoc.data() as Card;
      
      // Check if user owns this card
      if (cardData.userId !== user.uid) {
        throw new Error("Not authorized to delete this card");
      }
      
      // Delete the card
      await deleteDoc(cardRef);
      
      // Also delete related stats and views
      const statsRef = doc(firestore, "cardStats", cardId);
      await deleteDoc(statsRef);
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  }

  /**
   * Track a card view for analytics
   */
  private async trackCardView(cardId: string): Promise<void> {
    try {
      // Create view record
      const viewsRef = collection(firestore, "cardViews");
      await addDoc(viewsRef, {
        cardId,
        type: "view",
        timestamp: serverTimestamp(),
        uid: auth.currentUser?.uid || "anonymous"
      });
      
      // Update view count
      const statsRef = doc(firestore, "cardStats", cardId);
      await updateDoc(statsRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      }).catch(() => {
        // If stats doc doesn't exist yet, create it
        setDoc(statsRef, {
          views: 1,
          scans: 0,
          downloads: 0,
          shares: 0,
          cardId,
          updatedAt: serverTimestamp()
        });
      });
    } catch (error) {
      // Silently log errors tracking views, but don't throw
      console.error("Error tracking card view:", error);
    }
  }
}

export const directFirestoreService = new DirectFirestoreService();
