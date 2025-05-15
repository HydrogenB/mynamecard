import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Get all cards for a user
 * This cloud function allows the frontend to fetch cards without querying Firestore directly
 */
export const getUserCards = functions.https.onCall(async (data: any, context: any) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to view cards'
    );
  }

  // The user ID to fetch cards for - users can only fetch their own cards
  const userId = data.userId || context.auth.uid;
  
  // Only allow users to fetch their own cards (except for admin operations)
  if (userId !== context.auth.uid && !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You can only access your own cards'
    );
  }
  
  try {
    // Query cards owned by the user
    const cardsQuery = await db.collection('cards')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    if (cardsQuery.empty) {
      return { cards: [] };
    }
    
    // Format the response
    const cards = cardsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { cards };
  } catch (error: any) {
    console.error('Error getting user cards:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to fetch cards: ${error.message}`,
      error
    );
  }
});
