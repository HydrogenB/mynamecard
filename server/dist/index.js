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
    const html = (0, ssrService_1.renderCardHTML)(card, slug);
    res.send(html);
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
