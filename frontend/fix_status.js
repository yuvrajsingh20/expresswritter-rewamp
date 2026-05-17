const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log("Looking for projects with 'QUALITY_CHECK' status...");
  
  // We use Prisma locally because our local schema knows about QUALITY_CHECK
  const projects = await prisma.project.findMany({
    where: {
      status: 'QUALITY_CHECK'
    }
  });
  
  console.log(`Found ${projects.length} projects to fix.`);
  
  if (projects.length > 0) {
    const res = await prisma.project.updateMany({
      where: {
        status: 'QUALITY_CHECK'
      },
      data: {
        status: 'REVIEW' // A universally safe status
      }
    });
    console.log(`Updated ${res.count} projects to 'REVIEW'.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
