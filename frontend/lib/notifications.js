import { notificationQueue } from './queues';
import { sendEmail } from './mail';

/**
 * SMART NOTIFICATION DISPATCHER
 * Automatically handles the difference between Production (Real Redis) 
 * and Development (Mock Redis).
 */
export async function dispatchNotification(type, data) {
  const isMock = process.env.NODE_ENV === 'development' && !process.env.REDIS_URL;

  if (isMock) {
    console.log(`💡 Mock Redis detected. Bypassing BullMQ and processing "${type}" notification immediately.`);
    
    // Direct Execution for Development
    try {
      if (type === 'verification') {
         await sendEmail({
           to: data.email,
           subject: 'Verify Your Email - Express Writer',
           html: data.html
         });
      } else if (type === 'forgot-password') {
         await sendEmail({
           to: data.email,
           subject: 'Reset Your Password - Express Writer',
           html: data.html
         });
      }
      // Add other quick-dispatch handlers here
      return { id: 'mock-job-done' };
    } catch (error) {
      console.error('❌ Quick-dispatch failed:', error);
      throw error;
    }
  }

  // Real Queue Execution for Production
  return notificationQueue.add(type, data);
}
