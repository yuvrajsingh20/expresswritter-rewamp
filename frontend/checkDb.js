const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  console.log(`Users: ${userCount}`);
  console.log(`Projects: ${projectCount}`);

  if (projectCount > 0) {
    const projects = await prisma.project.findMany({
      take: 2,
      select: {
        id: true,
        title: true,
        status: true,
        freelancerId: true
      }
    });
    console.log('Sample projects:', JSON.stringify(projects, null, 2));
  } else {
    console.log('No projects found in the database.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
