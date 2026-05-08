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
export const notificationQueue = new Queue('notifications', defaultOptions);

/**
 * Queue for complex automation tasks like auto-assignment and PDF generation
 */
export const automationQueue = new Queue('automation', defaultOptions);

/**
 * Queue for payment-related post-processing logic (Razorpay hooks)
 */
export const paymentQueue = new Queue('payments', defaultOptions);
