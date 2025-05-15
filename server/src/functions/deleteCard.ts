import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Deletes a card and updates user's card count
 * Users can only delete their own cards
 */
export const deleteCard = functions.https.onCall(async (data: any, context: any) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete a card'
    );
  }

  const userId = context.auth.uid;
  const { cardId } = data;
  
  if (!cardId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Card ID is required'
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
    
    const cardData = cardDoc.data();
    
    // Check if the user owns the card
    if (cardData?.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this card'
      );
    }
    
    // Delete the card
    await cardRef.delete();
    
    // Decrement the user's card count
    const userRef = db.collection('users').doc(userId);
    
    // Use a transaction to safely decrement the count
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentCount = userData?.cardsCreated || 0;
        
        if (currentCount > 0) {
          transaction.update(userRef, {
            cardsCreated: currentCount - 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });
    
    // Try to delete related data (stats, views, etc.)
    try {
      // Delete card stats
      await db.collection('cardStats').doc(cardId).delete();
      
      // We won't delete views/logs to maintain analytics history
    } catch (cleanupError) {
      console.error('Error cleaning up related card data:', cleanupError);
      // Don't fail the entire operation if cleanup has issues
    }
    
    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error deleting card:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to delete card: ${error.message}`,
      error
    );
  }
});
