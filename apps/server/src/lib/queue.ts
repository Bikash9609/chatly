/**
 * Queue adapter interface.
 * Concrete implementations: InMemoryQueue (default) | RedisQueue (if REDIS_URL set).
 * Matchmaking logic never changes regardless of which adapter is active.
 */
export interface QueueAdapter {
  push(topic: string, entry: QueueEntry): Promise<void>;
  pop(topic: string): Promise<QueueEntry | null>;
  remove(topic: string, socketId: string): Promise<void>;
  size(topic: string): Promise<number>;
}

export interface QueueEntry {
  socketId: string;
  uuid: string;
  topic: string;
  joinedAt: number;
}

// ---------------------------------------------------------------------------
// In-Memory implementation (default when REDIS_URL is not set)
// ---------------------------------------------------------------------------
class InMemoryQueue implements QueueAdapter {
  private queues = new Map<string, QueueEntry[]>();

  private getQueue(topic: string): QueueEntry[] {
    if (!this.queues.has(topic)) this.queues.set(topic, []);
    return this.queues.get(topic)!;
  }

  async push(topic: string, entry: QueueEntry): Promise<void> {
    this.getQueue(topic).push(entry);
  }

  async pop(topic: string): Promise<QueueEntry | null> {
    const queue = this.getQueue(topic);
    return queue.shift() ?? null;
  }

  async remove(topic: string, socketId: string): Promise<void> {
    const queue = this.getQueue(topic);
    const idx = queue.findIndex((e) => e.socketId === socketId);
    if (idx !== -1) queue.splice(idx, 1);
  }

  async size(topic: string): Promise<number> {
    return this.getQueue(topic).length;
  }
}

// ---------------------------------------------------------------------------
// Redis implementation (activated when REDIS_URL is present)
// ---------------------------------------------------------------------------
async function buildRedisQueue(url: string): Promise<QueueAdapter> {
  // Dynamically import ioredis so the server still starts without it installed
  const { default: Redis } = await import('ioredis').catch(() => {
    throw new Error('ioredis is not installed. Run: yarn workspace @chatly/server add ioredis');
  });

  const client = new Redis(url);
  console.log('[queue] Redis adapter active');

  const key = (topic: string) => `chatly:queue:${topic}`;

  return {
    async push(topic, entry) {
      await client.rpush(key(topic), JSON.stringify(entry));
    },
    async pop(topic) {
      const raw = await client.lpop(key(topic));
      return raw ? (JSON.parse(raw) as QueueEntry) : null;
    },
    async remove(topic, socketId) {
      const raw = await client.lrange(key(topic), 0, -1);
      const filtered = (raw as string[]).filter((r: string) => {
        const e = JSON.parse(r) as QueueEntry;
        return e.socketId !== socketId;
      });
      await client.del(key(topic));
      if (filtered.length > 0) await client.rpush(key(topic), ...filtered);
    },
    async size(topic) {
      return client.llen(key(topic));
    },
  };
}

// ---------------------------------------------------------------------------
// Factory — auto-selects adapter based on REDIS_URL env var
// ---------------------------------------------------------------------------
let adapter: QueueAdapter | null = null;

export async function getQueueAdapter(): Promise<QueueAdapter> {
  if (adapter) return adapter;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      adapter = await buildRedisQueue(redisUrl);
    } catch (err) {
      console.warn('[queue] Redis unavailable, falling back to in-memory.', err);
      adapter = new InMemoryQueue();
    }
  } else {
    console.log('[queue] In-memory queue active (set REDIS_URL to enable Redis)');
    adapter = new InMemoryQueue();
  }

  return adapter;
}
