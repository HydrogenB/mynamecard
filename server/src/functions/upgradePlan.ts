import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Upgrade a user's plan to pro
 * This would typically involve processing payment via a payment processor like Stripe
 */
export const upgradePlan = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;
  const { paymentToken } = data;

  if (!paymentToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment token is required');
  }

  // In a real implementation, you would process the payment here
  // For example, using Stripe to charge the customer
  // This is just a placeholder for demonstration purposes
  
  try {
    // Update the user's plan in Firestore
    await db.collection('users').doc(uid).set({
      plan: 'pro',
      upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
      cardLimit: 10
    }, { merge: true });

    // Return the updated plan info
    return {
      plan: 'pro',
      cardLimit: 10,
      success: true,
      message: 'Plan upgraded successfully'
    };
  } catch (error) {
    console.error('Error upgrading plan:', error);
    throw new functions.https.HttpsError('internal', 'Failed to upgrade plan');
  }
});
