import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo } from './lib/mongo';
import { setupSocketHandlers } from './socket/handlers';
import { Feedback } from './models';

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

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo().catch(err => console.error('[mongo] Init failed:', err));
  
  setupSocketHandlers(io);
  
  httpServer.listen(PORT, () => {
    console.log(`[server] Ready on port ${PORT}`);
  });
}

start();
