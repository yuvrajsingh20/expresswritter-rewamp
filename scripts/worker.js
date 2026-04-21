import { Worker } from 'bullmq';
import redisConnection from '../lib/redis.js';
import prisma from '../lib/prisma.js';
import { sendProjectNotification, sendVerificationEmail } from '../lib/mail.js';

// --- Notification Worker ---
const notificationWorker = new Worker('notifications', async (job) => {
  const { projectId, userId, type, email, name, token } = job.data;
  console.log(`[NotificationWorker] Processing job ${job.id} - Type: ${type}`);

  try {
    if (type === 'VERIFICATION') {
      await sendVerificationEmail(email, name, token);
      console.log(`[EmailService] ✅ Verification email sent to ${email}`);
      return;
    }

    // Handle project notifications
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { student: true }
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    console.log(`[EmailService] Sending status update (${project.status}) to ${project.student.email}...`);
    await sendProjectNotification(project.student.email, project.title, project.status);

    console.log(`[NotificationWorker] ✅ Successfully processed ${type} for ${project.student.name}`);
  } catch (err) {
    console.error(`[NotificationWorker] ❌ Failed to process job ${job.id}:`, err.message);
    throw err; 
  }
}, { connection: redisConnection });

// --- Automation Worker ---
const automationWorker = new Worker('automation', async (job) => {
  const { projectId, action } = job.data;
  console.log(`[AutomationWorker] Executing ${action} for Project ${projectId}`);

  if (action === 'AUTO_ASSIGN') {
    const subAdmins = await prisma.user.findMany({
      where: { role: 'SUB_ADMIN' },
      include: { _count: { select: { managedProjects: true } } } // Updated to match schema relation name
    });

    if (subAdmins.length > 0) {
      const bestFit = subAdmins.sort((a, b) => a._count.managedProjects - b._count.managedProjects)[0];
      
      await prisma.project.update({
        where: { id: projectId },
        data: { subAdminId: bestFit.id, status: 'ASSIGNED' }
      });

      console.log(`[AutomationWorker] Project ${projectId} automatically assigned to SubAdmin ${bestFit.name}`);
    }
  }
}, { connection: redisConnection });

console.log('🚀 Production-Level Background Workers started. Integration: developer@admivo.in');
