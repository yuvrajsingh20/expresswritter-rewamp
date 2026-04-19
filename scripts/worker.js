import { Worker } from 'bullmq';
import redisConnection from '../lib/redis.js';
import prisma from '../lib/prisma.js';

// --- Notification Worker ---
const notificationWorker = new Worker('notifications', async (job) => {
  const { projectId, userId, type } = job.data;
  console.log(`[NotificationWorker] Processing job ${job.id} for Project ${projectId}`);

  try {
    // 1. Fetch relevant data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { student: true }
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    // 2. Mock Email Sending (Automation Logic)
    console.log(`[EmailService] Sending ${type} to ${project.student.email}...`);
    
    // Simulate API delay (e.g., SendGrid/Amazon SES)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Mark in DB if needed (Optional: Notification log)
    console.log(`[NotificationWorker] ✅ Successfully processed ${type} for ${project.student.name}`);
  } catch (err) {
    console.error(`[NotificationWorker] ❌ Failed to process job ${job.id}:`, err.message);
    throw err; // Allow BullMQ to retry based on attempt settings
  }
}, { connection: redisConnection });

// --- Automation Worker ---
const automationWorker = new Worker('automation', async (job) => {
  const { projectId, action } = job.data;
  console.log(`[AutomationWorker] Executing ${action} for Project ${projectId}`);

  if (action === 'AUTO_ASSIGN') {
    // Logic: Find the SubAdmin with the lowest current workload
    const subAdmins = await prisma.user.findMany({
      where: { role: 'SUB_ADMIN' },
      include: { _count: { select: { subAdminProjects: true } } }
    });

    if (subAdmins.length > 0) {
      const bestFit = subAdmins.sort((a, b) => a._count.subAdminProjects - b._count.subAdminProjects)[0];
      
      await prisma.project.update({
        where: { id: projectId },
        data: { subAdminId: bestFit.id, status: 'ASSIGNED' }
      });

      console.log(`[AutomationWorker] Project ${projectId} automatically assigned to SubAdmin ${bestFit.name}`);
    }
  }
}, { connection: redisConnection });

console.log('🚀 Background Workers started successfully. Listening for jobs...');
