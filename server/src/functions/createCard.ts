import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { generateSlug } from '../utils/slugGenerator';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * CreateCard API - Securely creates cards from the backend
 * This avoids permission issues with direct frontend access to Firestore
 */
export const createCard = functions.https.onCall(async (data: any, context: any) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a card'
    );
  }

  const userId = context.auth.uid;
  
  try {
    // Get the user document to check card limits
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    let userData;
    
    // If user profile doesn't exist, create one
    if (!userDoc.exists) {
      console.log('User profile does not exist. Creating...');
      userData = {
        uid: userId,
        email: context.auth.token.email || '',
        displayName: context.auth.token.name || '',
        photoURL: context.auth.token.picture || '',
        plan: 'free',
        cardLimit: 2, // Default free plan limit
        cardsCreated: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await userRef.set(userData);
      console.log('Created new user profile for', userId);
    } else {
      userData = userDoc.data();
    }
    
    // Get card limits from system config
    const limitsRef = db.collection('system_config').doc('card_limits');
    const limitsDoc = await limitsRef.get();
    
    let cardLimit = 2; // Default free plan limit
    
    if (limitsDoc.exists) {
      const limits = limitsDoc.data();
      const userPlan = userData.plan || 'free';
      cardLimit = limits[userPlan] || 2;
    } else {
      // Create card limits if they don't exist
      await limitsRef.set({
        free: 2,
        pro: 999,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Check if user has reached their card limit
    const cardsCreated = userData.cardsCreated || 0;
    if (cardsCreated >= cardLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Card limit reached. Please upgrade your plan to create more cards.'
      );
    }
    
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug && data.firstName && data.lastName) {
      slug = generateSlug(data.firstName, data.lastName);
    }
    
    // Check if slug is already in use
    const slugQuery = await db.collection('cards')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (!slugQuery.empty) {
      // If slug exists, append a random number
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Create the card document
    const cardData = {
      ...data,
      slug,
      userId,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const cardRef = db.collection('cards').doc();
    await cardRef.set(cardData);
    
    // Increment the user's card count
    await userRef.update({
      cardsCreated: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create a card stats document
    await db.collection('cardStats').doc(cardRef.id).set({
      views: 0,
      downloads: 0,
      shares: 0,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return the created card ID and slug
    return { 
      success: true, 
      cardId: cardRef.id,
      slug: slug
    };
      } catch (error: any) {
    console.error('Error creating card:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create card: ${error.message}`,
      error
    );
  }
});
