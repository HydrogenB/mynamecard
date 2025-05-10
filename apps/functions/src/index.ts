import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { toVCF } from './lib/vcard';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Get VCF for a card by slug
app.get('/vcf/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // Query Firestore for the card with this slug
    const cardsSnapshot = await admin.firestore()
      .collection('cards')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();
    
    if (cardsSnapshot.empty) {
      return res.status(404).send('Card not found');
    }
    
    const cardData = cardsSnapshot.docs[0].data();
    const vcf = toVCF(cardData.vcard);
    
    // Set headers for VCF download
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
    
    // Send the VCF file
    res.send(vcf);
    
  } catch (error) {
    console.error('Error generating VCF:', error);
    res.status(500).send('Error generating VCF');
  }
});

// Reserve a slug for a new card
app.post('/reserve-slug', async (req, res) => {
  try {
    const { fullName, uid } = req.body;
    
    if (!fullName || !uid) {
      return res.status(400).json({ error: 'Missing fullName or uid' });
    }
    
    // Generate a slug from the full name
    const baseSlug = fullName
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    let slug = baseSlug;
    let counter = 1;
    let isAvailable = false;
    
    // Check if slug is available, if not, append counter
    while (!isAvailable) {
      const slugSnapshot = await admin.firestore()
        .collection('cards')
        .where('slug', '==', slug)
        .limit(1)
        .get();
      
      if (slugSnapshot.empty) {
        isAvailable = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    return res.status(200).json({ slug });
    
  } catch (error) {
    console.error('Error reserving slug:', error);
    res.status(500).json({ error: 'Error reserving slug' });
  }
});

// Check user quota before creating a new card
app.post('/check-quota', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing uid' });
    }
    
    // Count active cards for this user
    const cardsSnapshot = await admin.firestore()
      .collection('cards')
      .where('owner', '==', uid)
      .where('status', '==', 'published')
      .get();
    
    const cardCount = cardsSnapshot.size;
    const freeQuota = 1;
    
    // Check if user has reached the free quota limit
    if (cardCount >= freeQuota) {
      return res.status(403).json({ 
        error: 'QUOTA_EXCEEDED',
        message: 'Free plan users can only create one card',
        current: cardCount,
        limit: freeQuota
      });
    }
    
    return res.status(200).json({ 
      allowed: true, 
      current: cardCount,
      limit: freeQuota
    });
    
  } catch (error) {
    console.error('Error checking quota:', error);
    res.status(500).json({ error: 'Error checking quota' });
  }
});

export const api = functions.https.onRequest(app);

// Handle user creation
export const onUserCreated = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    plan: 'free'
  });
});
