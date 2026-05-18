import { notificationQueue } from './queues';
import { sendEmail } from './mail';

/**
 * SMART NOTIFICATION DISPATCHER
 * Handles both Production (Real Redis BullMQ) and Development (direct execution).
 * Used for: verification, forgot-password, and any custom email type.
 */
export async function dispatchNotification(type, data) {
  const isMock = !process.env.REDIS_URL;

  if (isMock) {
    console.log(`💡 [Mock] Direct-dispatching "${type}" email...`);
    try {
      // All types that need email sending
      if (['verification', 'forgot-password', 'email'].includes(type)) {
        await sendEmail({
          to:      data.email,
          subject: data.subject || subjectFor(type),
          html:    data.html,
        });
      }
      return { id: 'mock-job-done' };
    } catch (error) {
      console.error('❌ Quick-dispatch failed:', error);
      throw error;
    }
  }

  return notificationQueue.add(type, data);
}

function subjectFor(type) {
  const map = {
    'verification':   'Verify Your Email — Express Writer',
    'forgot-password':'Reset Your Password — Express Writer',
    'email':          'Message from Express Writer',
  };
  return map[type] || 'Express Writer Notification';
}
