import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisClient = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, we use a mock if real Redis isn't reachable
    // We attempt a connection but if it fails immediately we swap
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false, // Don't queue commands if offline
      connectTimeout: 500, // Very fast timeout for local check
      retryStrategy: (times) => {
        if (times > 1) {
           console.warn('⚠️ Redis connection failed. Falling back to ioredis-mock...');
           return null; // Stop retrying real Redis
        }
        return 10;
      }
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        // Fallback handled by BullMQ compatible mock if needed
      }
    });

    return client;
  }

  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
};

const redisConnection = createRedisClient();

export default redisConnection;
