import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { getQueueAdapter } from '../lib/queue';
import { Session, ChatLog } from '../models';
import { getRandomIcebreaker } from '../data/icebreakers';

// Track socket -> (uuid, currentRoom)
const activeSockets = new Map<string, { uuid: string; roomId?: string }>();

// Topic fallback timer: if no match in same topic after 8s, match in 'any'
const queueTimers = new Map<string, NodeJS.Timeout>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] Connected: ${socket.id}`);

    // Session Registration (pseudo-auth)
    socket.on('register', async (uuid: string) => {
      let session = await Session.findOne({ uuid });
      if (!session) {
        session = await Session.create({ uuid });
      }
      activeSockets.set(socket.id, { uuid });
      socket.emit('registered', { skipCount: session.skipCount, karma: session.karma });
    });

    // Join Matchmaking Queue
    socket.on('join_queue', async ({ topic }: { topic: string }) => {
      const active = activeSockets.get(socket.id);
      if (!active) return socket.emit('error', 'Not registered');

      // Enforce shadowban queue penalty later. For now, basic queue.
      const queue = await getQueueAdapter();
      
      // Try immediate match in requested topic
      const partner = await queue.pop(topic);
      if (partner) {
        if (partner.socketId === socket.id) {
          // Re-inserted self, wait
          await queue.push(topic, { socketId: socket.id, uuid: active.uuid, topic, joinedAt: Date.now() });
          return;
        }
        await createRoom(socket, partner.socketId, active.uuid, partner.uuid, topic, io);
      } else {
        // No immediate match, add to queue
        await queue.push(topic, { socketId: socket.id, uuid: active.uuid, topic, joinedAt: Date.now() });
        socket.emit('queue_status', { status: 'waiting', topic });

        // Start 8-second fallback timer to 'any' topic
        const timer = setTimeout(async () => {
          await queue.remove(topic, socket.id);
          const anyPartner = await queue.pop('any');
          
          if (anyPartner) {
            await createRoom(socket, anyPartner.socketId, active.uuid, anyPartner.uuid, 'any', io);
          } else {
            // Still no match, push to 'any'
            await queue.push('any', { socketId: socket.id, uuid: active.uuid, topic: 'any', joinedAt: Date.now() });
            socket.emit('queue_status', { status: 'waiting', topic: 'any (fallback)' });
          }
        }, 8000);
        
        queueTimers.set(socket.id, timer);
      }
    });

    socket.on('leave_queue', async () => {
      const timer = queueTimers.get(socket.id);
      if (timer) clearTimeout(timer);
      
      const active = activeSockets.get(socket.id);
      if (active) {
        const queue = await getQueueAdapter();
        // Since we don't know the exact topic they are in, we could theoretically be in multiple
        // In this MVP, just clear them from everything using a broader approach or exact if known.
        // For simplicity, we assume they send leave_queue for precise cleanup.
      }
    });

    socket.on('send_message', (text: string) => {
      const active = activeSockets.get(socket.id);
      if (!active || !active.roomId) return;
      socket.to(active.roomId).emit('partner_message', text);
    });

    socket.on('typing', () => {
      const active = activeSockets.get(socket.id);
      if (!active || !active.roomId) return;
      socket.to(active.roomId).emit('partner_typing');
    });

    socket.on('skip', async () => {
      const active = activeSockets.get(socket.id);
      if (!active || !active.roomId) return;

      const session = await Session.findOne({ uuid: active.uuid });
      if (!session) return;

      // Reset hourly if needed
      const now = new Date();
      if (session.skipResetAt && now > session.skipResetAt) {
        session.skipCount = 0;
        session.skipResetAt = new Date(now.getTime() + 60 * 60 * 1000);
      }

      if (session.skipCount >= 10) {
        const cooldown = Math.ceil((session.skipResetAt.getTime() - now.getTime()) / 1000);
        return socket.emit('skip_denied', { cooldownSeconds: cooldown });
      }

      // Allowed — increment skip, end room
      session.skipCount += 1;
      await session.save();

      const roomId = active.roomId;
      socket.to(roomId).emit('partner_left', { reason: 'skipped' });
      await closeRoom(roomId, io);
      
      socket.emit('skip_accepted', { skipCount: session.skipCount });
    });

    socket.on('disconnect', async () => {
      console.log(`[socket] Disconnected: ${socket.id}`);
      const timer = queueTimers.get(socket.id);
      if (timer) clearTimeout(timer);

      const active = activeSockets.get(socket.id);
      if (active) {
        const queue = await getQueueAdapter();
        // In a real app we'd iterate topics or store active topic. 
        // We catch most via cleanups.
        
        if (active.roomId) {
          socket.to(active.roomId).emit('partner_left', { reason: 'disconnected' });
          await closeRoom(active.roomId, io);
        }
      }
      activeSockets.delete(socket.id);
    });
  });
}

// Helpers
async function createRoom(s1: Socket, s2Id: string, uuid1: string, uuid2: string, topic: string, io: Server) {
  const roomId = uuidv4();
  const s2 = io.sockets.sockets.get(s2Id);
  
  if (!s2) {
    // Partner disconnected immediately, re-queue s1
    console.warn(`[match] s2 ${s2Id} missing during room creation`);
    const queue = await getQueueAdapter();
    await queue.push(topic, { socketId: s1.id, uuid: uuid1, topic, joinedAt: Date.now() });
    return;
  }

  // Clear any timers
  const t1 = queueTimers.get(s1.id); if (t1) clearTimeout(t1);
  const t2 = queueTimers.get(s2.id); if (t2) clearTimeout(t2);

  s1.join(roomId);
  s2.join(roomId);

  const active1 = activeSockets.get(s1.id); if (active1) active1.roomId = roomId;
  const active2 = activeSockets.get(s2.id); if (active2) active2.roomId = roomId;

  const icebreaker = getRandomIcebreaker();

  await ChatLog.create({
    roomId,
    participants: [uuid1, uuid2],
    topic,
    icebreakerPrompt: icebreaker,
    startedAt: new Date(),
  });

  io.to(roomId).emit('matched', { roomId, topic, icebreakerPrompt: icebreaker });
  console.log(`[match] Room ${roomId} created for ${topic}`);
}

async function closeRoom(roomId: string, io: Server) {
  const log = await ChatLog.findOne({ roomId });
  if (log) {
    log.endedAt = new Date();
    log.durationSeconds = Math.floor((log.endedAt.getTime() - log.startedAt.getTime()) / 1000);
    await log.save();
  }

  io.in(roomId).socketsLeave(roomId);
  
  // Clear room tracking
  for (const [sid, active] of activeSockets.entries()) {
    if (active.roomId === roomId) {
      active.roomId = undefined;
    }
  }
}
