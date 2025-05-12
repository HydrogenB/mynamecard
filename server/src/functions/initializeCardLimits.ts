import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initiate Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud function to initialize the card limits configuration in Firestore.
 * This would typically be run once when setting up the system.
 */
export const initializeCardLimits = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();

  try {
    // Create or update the card_limits document
    await db.collection('system_config').doc('card_limits').set({
      free: 2,
      pro: 10,
    });

    res.status(200).json({ success: true, message: 'Card limits initialized' });
  } catch (error) {
    console.error('Error initializing card limits:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize card limits' });
  }
});
