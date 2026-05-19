import prisma from '../lib/prisma.js';

async function cleanup() {
  console.log('Starting cleanup of orphaned PENDING orders...');
  
  const result = await prisma.order.updateMany({
    where: {
      paymentStatus: 'PENDING',
      createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) }
    },
    data: { paymentStatus: 'FAILED' }
  });
  
  console.log(`Closed ${result.count} orphaned PENDING orders.`);
  
  const pendingCount = await prisma.order.count({
    where: { paymentStatus: 'PENDING' }
  });
  console.log(`Remaining PENDING orders: ${pendingCount}`);
  
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});