const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany({ select: { id: true, studentId: true } });
  let bad = [];
  for (const p of projects) {
    if (p.studentId) {
       const user = await prisma.user.findUnique({ where: { id: p.studentId } });
       if (!user) {
         bad.push(p.id);
       }
    } else {
       bad.push(p.id);
    }
  }
  console.log('Bad projects:', bad);
  
  if (bad.length > 0) {
    // Delete any related orders or chats first to avoid constraint errors if any
    try { await prisma.order.deleteMany({ where: { projectId: { in: bad } } }); } catch(e){}
    try { await prisma.projectLog.deleteMany({ where: { projectId: { in: bad } } }); } catch(e){}
    
    const res = await prisma.project.deleteMany({ where: { id: { in: bad } } });
    console.log('Deleted bad projects:', res.count);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
