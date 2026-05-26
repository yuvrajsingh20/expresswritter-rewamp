const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_ROLES = ['ADMIN', 'SUB_ADMIN', 'FREELANCER', 'STUDENT'];
const VALID_PROJECT_STATUSES = ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'QUALITY_CHECK', 'UNDER_REVIEW', 'REVISION', 'COMPLETED'];
const VALID_CHAT_TYPES = ['CLIENT_CHAT', 'INTERNAL_CHAT', 'ADMIN_CHAT'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

async function checkCollection(collectionName, validationFn) {
  try {
    const response = await prisma.$runCommandRaw({
      find: collectionName,
      limit: 10000
    });
    //test
    const documents = response.cursor.firstBatch;
    let issues = [];
    
    for (const doc of documents) {
      const issue = await validationFn(doc);
      if (issue) {
        issues.push({ id: doc._id?.$oid || doc._id, issue });
      }
    }
    return issues;
  } catch (err) {
    console.error(`Error checking ${collectionName}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('--- Starting Full Database Consistency Check ---\n');
  
  // Cache users and projects for quick relation checking
  console.log('Caching valid IDs...');
  const usersRaw = await prisma.$runCommandRaw({ find: 'User', limit: 10000 });
  const validUserIds = new Set(usersRaw.cursor.firstBatch.map(u => u._id?.$oid || u._id));
  
  const projectsRaw = await prisma.$runCommandRaw({ find: 'Project', limit: 10000 });
  const validProjectIds = new Set(projectsRaw.cursor.firstBatch.map(p => p._id?.$oid || p._id));
  
  console.log(`Found ${validUserIds.size} users and ${validProjectIds.size} projects.\n`);

  // 1. Check Users
  const userIssues = await checkCollection('User', async (doc) => {
    if (doc.role && !VALID_ROLES.includes(doc.role)) return `Invalid role enum: ${doc.role}`;
    return null;
  });
  console.log(`User issues found: ${userIssues.length}`);
  userIssues.forEach(i => console.log(`  - User ${i.id}: ${i.issue}`));

  // 2. Check Projects
  const projectIssues = await checkCollection('Project', async (doc) => {
    if (doc.status && !VALID_PROJECT_STATUSES.includes(doc.status)) return `Invalid status enum: ${doc.status}`;
    const studentId = doc.studentId?.$oid || doc.studentId;
    if (!studentId) return `Missing required studentId`;
    if (!validUserIds.has(studentId)) return `studentId ${studentId} points to non-existent User`;
    return null;
  });
  console.log(`Project issues found: ${projectIssues.length}`);
  projectIssues.forEach(i => console.log(`  - Project ${i.id}: ${i.issue}`));

  // 3. Check Orders
  const orderIssues = await checkCollection('Order', async (doc) => {
    if (doc.paymentStatus && !VALID_PAYMENT_STATUSES.includes(doc.paymentStatus)) return `Invalid paymentStatus enum: ${doc.paymentStatus}`;
    const studentId = doc.studentId?.$oid || doc.studentId;
    const projectId = doc.projectId?.$oid || doc.projectId;
    if (!studentId || !validUserIds.has(studentId)) return `Missing or invalid studentId: ${studentId}`;
    if (!projectId || !validProjectIds.has(projectId)) return `Missing or invalid projectId: ${projectId}`;
    return null;
  });
  console.log(`Order issues found: ${orderIssues.length}`);
  orderIssues.forEach(i => console.log(`  - Order ${i.id}: ${i.issue}`));

  // 4. Check Messages
  const messageIssues = await checkCollection('Message', async (doc) => {
    if (doc.chatType && !VALID_CHAT_TYPES.includes(doc.chatType)) return `Invalid chatType enum: ${doc.chatType}`;
    const senderId = doc.senderId?.$oid || doc.senderId;
    if (!senderId || !validUserIds.has(senderId)) return `Missing or invalid senderId: ${senderId}`;
    return null;
  });
  console.log(`Message issues found: ${messageIssues.length}`);
  messageIssues.forEach(i => console.log(`  - Message ${i.id}: ${i.issue}`));

  // 5. Check ProjectLogs
  const logIssues = await checkCollection('ProjectLog', async (doc) => {
    const userId = doc.userId?.$oid || doc.userId;
    const projectId = doc.projectId?.$oid || doc.projectId;
    if (!userId || !validUserIds.has(userId)) return `Missing or invalid userId: ${userId}`;
    if (!projectId || !validProjectIds.has(projectId)) return `Missing or invalid projectId: ${projectId}`;
    return null;
  });
  console.log(`ProjectLog issues found: ${logIssues.length}`);
  logIssues.forEach(i => console.log(`  - Log ${i.id}: ${i.issue}`));
  
  // 6. Check Chats
  const chatIssues = await checkCollection('Chat', async (doc) => {
    const studentId = doc.studentId?.$oid || doc.studentId;
    if (!studentId || !validUserIds.has(studentId)) return `Missing or invalid studentId: ${studentId}`;
    return null;
  });
  console.log(`Chat issues found: ${chatIssues.length}`);
  chatIssues.forEach(i => console.log(`  - Chat ${i.id}: ${i.issue}`));

  console.log('\n--- Check Complete ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
