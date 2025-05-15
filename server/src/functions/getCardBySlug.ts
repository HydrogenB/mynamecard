import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Gets a card by slug
 * Cards can be accessed by anyone if they have the slug, but only if the card is active (public)
 */
export const getCardBySlug = functions.https.onCall(async (data: any, context: any) => {
  // Get the slug from the request data
  const slug = data.slug;
  
  if (!slug) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Slug is required'
    );
  }
  
  try {
    // Query cards with the provided slug
    const cardsQuery = await db.collection('cards')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (cardsQuery.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Card not found'
      );
    }
    
    const cardDoc = cardsQuery.docs[0];
    const cardData = cardDoc.data();
    
    // Check if the card is active or the user is the owner
    if (
      cardData.active === true || 
      (context.auth && cardData.userId === context.auth.uid)
    ) {
      // Track view for analytics if not the owner
      if (!context.auth || context.auth.uid !== cardData.userId) {
        try {
          const viewerId = context.auth ? context.auth.uid : 'anonymous';
          
          // Log view in analytics collection
          await db.collection('cardViews').add({
            cardId: cardDoc.id,
            slug: slug,
            viewerId: viewerId,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Update card stats
          const statsRef = db.collection('cardStats').doc(cardDoc.id);
          const statsDoc = await statsRef.get();
          
          if (statsDoc.exists) {
            await statsRef.update({
              views: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            await statsRef.set({
              cardId: cardDoc.id,
              views: 1,
              downloads: 0,
              shares: 0,
              userId: cardData.userId,
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
        'This card is not active or you do not have permission to access it'
      );
    }
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error getting card by slug:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to get card: ${error.message}`,
      error
    );
  }
});
