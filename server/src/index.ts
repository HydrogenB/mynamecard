import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { generateVCard } from './services/vcardService';
import { CardData, renderCardHTML } from './services/ssrService';

// In-memory cache for cards (simulating a database)
const cardCache: Map<string, CardData> = new Map();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../../apps/web/dist')));

// API endpoints
app.get('/api/vcf/:slug', (req, res) => {
  const { slug } = req.params;
  const card = cardCache.get(slug);
  
  if (!card) {
    return res.status(404).send('Card not found');
  }
  
  const vcf = generateVCard(card);
  
  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
  res.send(vcf);
});

// Register or update a card
app.post('/api/cards', (req, res) => {
  const { slug, data } = req.body;
  
  if (!slug || !data) {
    return res.status(400).send('Invalid card data');
  }
  
  cardCache.set(slug, data);
  res.status(200).json({ success: true });
});

// Public card route (SSR)
app.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const card = cardCache.get(slug);
  
  if (!card) {
    return res.redirect('/');
  }
  
  const html = renderCardHTML(card, slug);
  res.send(html);
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
