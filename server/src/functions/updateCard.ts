import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Updates an existing card
 * Users can only update their own cards
 */
export const updateCard = functions.https.onCall(async (data: any, context: any) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to update a card'
    );
  }

  const userId = context.auth.uid;
  const { cardId, cardData } = data;
  
  if (!cardId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Card ID is required'
    );
  }

  if (!cardData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Card data is required'
    );
  }
  
  try {
    // Get the card document to verify ownership
    const cardRef = db.collection('cards').doc(cardId);
    const cardDoc = await cardRef.get();
    
    if (!cardDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Card not found'
      );
    }
    
    const existingCard = cardDoc.data();
    
    // Check if the user owns the card
    if (existingCard?.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this card'
      );
    }
    
    // Remove fields that should not be updated
    const updates = { ...cardData };
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    
    // Add the updated timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Handle slug updates specially if slug is changing
    if (updates.slug && updates.slug !== existingCard.slug) {
      // Check if the new slug is already in use
      const slugQuery = await db.collection('cards')
        .where('slug', '==', updates.slug)
        .limit(1)
        .get();
        
      if (!slugQuery.empty) {
        // If slug exists, append a random number
        updates.slug = `${updates.slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }
    
    // Update the card
    await cardRef.update(updates);
    
    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error updating card:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update card: ${error.message}`,
      error
    );
  }
});
