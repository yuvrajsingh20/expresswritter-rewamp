import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client for MongoDB.
 */
const globalForPrisma = global;

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
