/**
 * ROLE PROMOTION SCRIPT
 * Usage: node scripts/promote.js <email> <ROLE>
 * Roles: ADMIN, SUB_ADMIN, FREELANCER, STUDENT
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote() {
  const email = process.argv[2];
  const role = process.argv[3]?.toUpperCase();

  if (!email || !role) {
    console.error('❌ Usage: node scripts/promote.js <email> <ROLE>');
    process.exit(1);
  }

  const validRoles = ['ADMIN', 'SUB_ADMIN', 'FREELANCER', 'STUDENT'];
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role. Choose from: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log(`✅ Success! User ${user.email} has been promoted to ${user.role}.`);
    console.log('🔄 Please log out and back in on the website to see the changes.');
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`❌ Error: No user found with email "${email}"`);
    } else {
      console.error('❌ An unexpected error occurred:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

promote();
