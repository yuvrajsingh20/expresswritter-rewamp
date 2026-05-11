import { Queue } from 'bullmq';
import redisConnection from './redis';

const defaultOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
};

/**
 * Queue for handling non-blocking background notifications (Email, In-App)
 */
export const notificationQueue = process.env.REDIS_URL ? new Queue('notifications', defaultOptions) : { add: async () => console.log('Mock notificationQueue add called') };

/**
 * Queue for complex automation tasks like auto-assignment and PDF generation
 */
export const automationQueue = process.env.REDIS_URL ? new Queue('automation', defaultOptions) : { add: async () => console.log('Mock automationQueue add called') };

/**
 * Queue for payment-related post-processing logic (Razorpay hooks)
 */
export const paymentQueue = process.env.REDIS_URL ? new Queue('payments', defaultOptions) : { add: async () => console.log('Mock paymentQueue add called') };
