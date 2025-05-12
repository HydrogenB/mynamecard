"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const ws_1 = require("ws");
const vcardService_1 = require("./services/vcardService");
const ssrService_1 = require("./services/ssrService");
// In-memory cache for cards (simulating a database)
const cardCache = new Map();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../../apps/web/dist')));
// Configuration values (would normally be in .env file)
const DEFAULT_CARD_LIMIT = 2;
const PRO_USER_CARD_LIMIT = 10;
// API endpoints
app.get('/api/vcf/:slug', (req, res) => {
    const { slug } = req.params;
    const card = cardCache.get(slug);
    if (!card) {
        return res.status(404).send('Card not found');
    }
    const vcf = (0, vcardService_1.generateVCard)(card);
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
    return res.send(vcf);
});
// Register or update a card
app.post('/api/cards', (req, res) => {
    const { slug, data, userId } = req.body;
    if (!slug || !data) {
        return res.status(400).send('Invalid card data');
    }
    // Ensure card has an active status field
    if (data.active === undefined) {
        data.active = true; // Default to active
    }
    // In a real implementation, we would verify the user token here
    // and check if they've reached their card limit
    cardCache.set(slug, data);
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
    const html = (0, ssrService_1.renderCardHTML)(card, slug);
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
    const indexPath = path_1.default.resolve(__dirname, '../../apps/web/dist/index.html');
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.status(404).send('Not found - make sure the frontend is built');
    }
});
const server = (0, http_1.createServer)(app);
// WebSocket server for live updates
const wss = new ws_1.WebSocketServer({ server });
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
        }
        catch (error) {
            console.error('WebSocket error:', error);
        }
    });
});
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
