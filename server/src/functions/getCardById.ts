import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Gets a card by ID
 * Users can only fetch their own cards, unless the card is marked as public (active: true)
 */
export const getCardById = functions.https.onCall(async (data: any, context: any) => {
  // Get the card ID from the request data
  const cardId = data.cardId;

  if (!cardId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Card ID is required'
    );
  }

  try {
    // Get the card document
    const cardRef = db.collection('cards').doc(cardId);
    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Card not found'
      );
    }

    const cardData = cardDoc.data();

    // If user is authenticated and is owner of the card, or the card is public
    if (
      (context.auth && cardData?.userId === context.auth.uid) ||
      cardData?.active === true
    ) {
      // Track view for analytics
      if (context.auth && context.auth.uid !== cardData?.userId) {
        try {
          // Log view in analytics collection
          await db.collection('cardViews').add({
            cardId: cardId,
            viewerId: context.auth ? context.auth.uid : 'anonymous',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Update card stats
          const statsRef = db.collection('cardStats').doc(cardId);
          const statsDoc = await statsRef.get();
          
          if (statsDoc.exists) {
            await statsRef.update({
              views: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            await statsRef.set({
              cardId: cardId,
              views: 1,
              downloads: 0,
              shares: 0,
              userId: cardData?.userId,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error tracking card view:', error);
        }
      }

      return { 
        card: {
          id: cardDoc.id,
          ...cardData
        }
      };
    } else {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to access this card'
      );
    }
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error getting card by ID:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to get card: ${error.message}`,
      error
    );
  }
});
