const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@123', 10);
  const now = new Date();

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin-expresswritter@yopmail.com' },
    update: {
      role: 'ADMIN',
      emailVerified: now,
      password,
    },
    create: {
      email: 'admin-expresswritter@yopmail.com',
      name: 'System Admin',
      password,
      role: 'ADMIN',
      emailVerified: now,
    },
  });

  console.log('Admin seeded:', admin.email);

  // Seed SubAdmin
  const subAdmin = await prisma.user.upsert({
    where: { email: 'subadmin-expresswritter@yopmail.com' },
    update: {
      role: 'SUB_ADMIN',
      emailVerified: now,
      password,
    },
    create: {
      email: 'subadmin-expresswritter@yopmail.com',
      name: 'Operations Manager',
      password,
      role: 'SUB_ADMIN',
      emailVerified: now,
    },
  });

  console.log('SubAdmin seeded:', subAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
