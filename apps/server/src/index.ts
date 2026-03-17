import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo } from './lib/mongo';
import { setupSocketHandlers } from './socket/handlers';
import { Feedback, AffiliateLink, ClickLog, Session } from './models';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Post-chat feedback endpoint (REST, since room might be closed)
app.post('/api/feedback', async (req, res) => {
  try {
    const { roomId, fromUuid, rating } = req.body;
    if (!roomId || !fromUuid || !rating) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    await Feedback.create({ roomId, fromUuid, rating });
    res.json({ success: true });
  } catch (err) {
    console.error('[api] Feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active affiliate link for a topic
app.get('/api/affiliates/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    // Case-insensitive lookup. If 'any', we can just pick the newest overall active link.
    const query = topic === 'any' ? { active: true } : { topic: new RegExp(`^${topic}$`, 'i'), active: true };
    const link = await AffiliateLink.findOne(query).sort({ createdAt: -1 });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch affiliate link' });
  }
});

// Admin: Save/Update affiliate link
app.post('/api/admin/affiliates', async (req, res) => {
  try {
    const { password, topic, url, title, imageUrl } = req.body;
    
    // Simple shared secret for MVP admin
    if (password !== 'chatly-admin-2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!topic || !url || !title) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Update existing or create new
    const link = await AffiliateLink.findOneAndUpdate(
      { topic, url },
      { topic, url, title, imageUrl, active: true },
      { new: true, upsert: true }
    );

    res.json({ success: true, link });
  } catch (err) {
    console.error('[admin] Save error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all links (for management)
app.get('/api/admin/affiliates', async (req, res) => {
  try {
    const { password } = req.query;
    if (password !== 'chatly-admin-2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const links = await AffiliateLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});


// Log click and redirect
app.post('/api/affiliates/click', async (req, res) => {
  try {
    const { linkId, uuid, utmSource, topic } = req.body;
    
    // Increment total clicks on the link
    await AffiliateLink.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } });
    
    // Log individual click for UTM tracking
    await ClickLog.create({
      uuid,
      linkId,
      utmSource,
      topic
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log click' });
  }
});

// Refill skips after rewarded ad (H5 GamesRewarded Ad)
app.post('/api/skips/refill', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) return res.status(400).json({ error: 'Missing UUID' });

    const session = await Session.findOne({ uuid });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Grant +3 skips
    session.skipCount = Math.max(0, session.skipCount - 3);
    await session.save();

    res.json({ success: true, skipCount: session.skipCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refill skips' });
  }
});

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo().catch(err => console.error('[mongo] Init failed:', err));
  
  setupSocketHandlers(io);
  
  httpServer.listen(PORT, () => {
    console.log(`[server] Ready on port ${PORT}`);
  });
}

start();
