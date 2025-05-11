import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { generateVCard } from './services/vcardService';
import { CardData, renderCardHTML } from './services/ssrService';

// Add these interfaces to support Firebase functionality
interface FirebaseCardData extends CardData {
  id?: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

admin.initializeApp();
const db = admin.firestore();
const cardsCollection = db.collection('cards');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(compression());
app.use(express.json());

// API Routes

// Get card by slug
app.get('/api/cards/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const cardsSnapshot = await cardsCollection.where('slug', '==', slug).limit(1).get();
    
    if (cardsSnapshot.empty) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const cardDoc = cardsSnapshot.docs[0];
    const card = { id: cardDoc.id, ...cardDoc.data() } as CardData;
    
    return res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create new card
app.post('/api/cards', async (req, res) => {
  try {
    const cardData = req.body as CardData;
    cardData.createdAt = new Date();
    cardData.updatedAt = new Date();
    
    const docRef = await cardsCollection.add(cardData);
    const newCard = { id: docRef.id, ...cardData };
    
    return res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update existing card
app.put('/api/cards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    updates.updatedAt = new Date();
    
    const cardRef = cardsCollection.doc(id);
    const cardDoc = await cardRef.get();
    
    if (!cardDoc.exists) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    await cardRef.update(updates);
    const updatedCard = { id, ...cardDoc.data(), ...updates };
    
    return res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete card
app.delete('/api/cards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const cardRef = cardsCollection.doc(id);
    const cardDoc = await cardRef.get();
    
    if (!cardDoc.exists) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    await cardRef.delete();
    
    return res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Generate vCard
app.get('/api/cards/:id/vcard', async (req, res) => {
  try {
    const id = req.params.id;
    const cardDoc = await cardsCollection.doc(id).get();
    
    if (!cardDoc.exists) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const cardData = cardDoc.data() as CardData;
    const vcardContent = generateVCard(cardData);
    
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename=${cardData.slug || id}.vcf`);
    return res.send(vcardContent);
  } catch (error) {
    console.error('Error generating vCard:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Render card HTML for preview
app.get('/api/cards/:id/preview', async (req, res) => {
  try {
    const id = req.params.id;
    const cardDoc = await cardsCollection.doc(id).get();
    
    if (!cardDoc.exists) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const cardData = cardDoc.data() as CardData;
    const html = renderCardHTML(cardData);
    
    return res.send(html);
  } catch (error) {
    console.error('Error rendering card preview:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Export the API as a Firebase Function
export const api = functions.https.onRequest(app);
