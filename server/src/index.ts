import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { generateVCard } from './services/vcardService';
import { CardData, renderCardHTML } from './services/ssrService';

// In-memory storage for data
const cardCache: Map<string, CardData> = new Map();
const users: Map<string, {
  email: string;
  displayName?: string;
  cardLimit: number;
  cardsCreated: number;
  plan: 'free' | 'pro';
}> = new Map();

// Hard-coded user for simple authentication
users.set('test-user-id', {
  email: 'test',
  displayName: 'Test User',
  cardLimit: 2,
  cardsCreated: 0,
  plan: 'free'
});

// Simple session management
const sessions: Map<string, string> = new Map(); // token to userId

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../../apps/web/dist')));

// Configuration values
const DEFAULT_CARD_LIMIT = 2;
const PRO_USER_CARD_LIMIT = 10;

// API endpoints

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Simple hard-coded authentication - username: test, password: test
  if (email === 'test' && password === 'test') {
    const token = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessions.set(token, 'test-user-id');
    
    return res.status(200).json({ 
      token,
      user: {
        uid: 'test-user-id',
        email: 'test',
        displayName: 'Test User'
      }
    });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
  }
  
  return res.status(200).json({ success: true });
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware to verify authentication
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.userId = sessions.get(token);
  next();
};

// Get current user profile
app.get('/api/users/me', authenticate, (req, res) => {
  const userId = req.userId as string;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.status(200).json({
    uid: userId,
    ...user,
    cardsRemaining: user.cardLimit - user.cardsCreated
  });
});

app.get('/api/vcf/:slug', (req, res) => {
  const { slug } = req.params;
  const card = cardCache.get(slug);
  
  if (!card) {
    return res.status(404).send('Card not found');
  }
  
  const vcf = generateVCard(card);
  
  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
  return res.send(vcf);
});

// Register or update a card
app.post('/api/cards', authenticate, (req, res) => {
  const { slug, data } = req.body;
  const userId = req.userId as string;
  
  if (!slug || !data) {
    return res.status(400).send('Invalid card data');
  }
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Check if user has reached their card limit
  // If it's an update (card already exists), we don't count against the limit
  const existingCard = cardCache.get(slug);
  const isNewCard = !existingCard || existingCard.userId !== userId;
  
  if (isNewCard && user.cardsCreated >= user.cardLimit) {
    return res.status(403).json({
      error: 'Card limit reached',
      limit: user.cardLimit,
      plan: user.plan
    });
  }
  
  // Ensure card has an active status field
  if (data.active === undefined) {
    data.active = true; // Default to active
  }
  
  // Add userId to the card data
  data.userId = userId;
  
  cardCache.set(slug, data);
  
  // Update user's card count if it's a new card
  if (isNewCard) {
    user.cardsCreated++;
    users.set(userId, user);
  }
  
  return res.status(200).json({ 
    success: true,
    cardsRemaining: user.cardLimit - user.cardsCreated 
  });
});

// Get user's cards
app.get('/api/cards', authenticate, (req, res) => {
  const userId = req.userId as string;
  
  // Filter cards by userId
  const userCards: { id: string; data: CardData }[] = [];
  
  cardCache.forEach((cardData, id) => {
    if (cardData.userId === userId) {
      userCards.push({ id, data: cardData });
    }
  });
  
  return res.status(200).json({ cards: userCards });
});

// Get card by ID
app.get('/api/cards/:id', authenticate, (req, res) => {
  const userId = req.userId as string;
  const cardId = req.params.id;
  
  const card = cardCache.get(cardId);
  
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  // Only return card if it belongs to the authenticated user
  if (card.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  return res.status(200).json({ 
    id: cardId, 
    ...card 
  });
});

// Delete card
app.delete('/api/cards/:id', authenticate, (req, res) => {
  const userId = req.userId as string;
  const cardId = req.params.id;
  
  const card = cardCache.get(cardId);
  
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  // Only allow deletion if the card belongs to the authenticated user
  if (card.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  cardCache.delete(cardId);
  
  // Update user's card count
  const user = users.get(userId);
  if (user && user.cardsCreated > 0) {
    user.cardsCreated--;
    users.set(userId, user);
  }
  
  return res.status(200).json({ success: true });
});

// Public card route (SSR)
app.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const card = cardCache.get(slug);
  
  if (!card) {
    return res.redirect('/');
  }
  
  // Check if card is active
  if (card.active === false) {
    return res.redirect('/');
  }
  
  const html = renderCardHTML(card, slug);
  res.send(html);
});

// Admin API to update user card limits
app.post('/api/admin/card-limits', (req, res) => {
  const { apiKey, userId, newLimit } = req.body;
  
  // Very basic admin API key check (would be much more secure in production)
  const adminApiKey = process.env.ADMIN_API_KEY || 'secret-admin-key';
  
  if (apiKey !== adminApiKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  if (!userId || typeof newLimit !== 'number') {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  // Update the user's card limit (in a real app, this would update the database)
  console.log(`Updated card limit for user ${userId} to ${newLimit}`);
  
  return res.status(200).json({ success: true });
});

// Fallback route to index.html for SPA
app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '../../apps/web/dist/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found - make sure the frontend is built');
  }
});

const server = createServer(app);

// WebSocket server for live updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const { type, data } = JSON.parse(message.toString());
      
      if (type === 'CARD_UPDATED') {
        const { slug, cardData } = data;
        cardCache.set(slug, cardData);
        
        // Broadcast the update to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
              type: 'CARD_UPDATED',
              data: { slug, cardData }
            }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
