import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

const createRedisClient = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev && !REDIS_URL) {
    const RedisMock = require('ioredis-mock');
    console.log('💡 No REDIS_URL found. Initializing ioredis-mock for development.');
    return new RedisMock();
  }

  // Attempt real connection if URL is provided
  const targetUrl = REDIS_URL || 'redis://localhost:6379';
  
  const client = new Redis(targetUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 1000,
    retryStrategy: (times) => {
      if (times > 1) {
         if (process.env.NODE_ENV === 'development') {
           return null; // Stop retrying real Redis to allow mock fallback
         }
         return Math.min(times * 500, 5000);
      }
      return 100;
    }
  });

  client.on('error', (err) => {
    // Only log critical errors if a URL was explicitly provided
    if (REDIS_URL && process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Redis Connection Issue: ${err.message}`);
    }
  });

  return client;
};

const redisConnection = createRedisClient();

export default redisConnection;
