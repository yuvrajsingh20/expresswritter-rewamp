const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Attempting to find a project with 'amount' field...");
    const project = await prisma.project.findFirst({
        select: { id: true, amount: true }
    });
    console.log("Success! Project found:", project);
  } catch (error) {
    console.error("Prisma Client Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
