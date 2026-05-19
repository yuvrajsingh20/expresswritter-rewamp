const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing STUDENT query...');
    const resultStudent = await prisma.project.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        createdAt: true,
        amount: true,
        serviceType: true,
        studentId: true,
        freelancerId: true,
        description: true,
        attachments: true,
        student: { select: { id: true, name: true, role: true } },
        freelancer: { select: { id: true, name: true, role: true } },
        subAdmin: false, // is_admin === false
        orders: { select: { paymentStatus: true } },
        _count: {
          select: {
            messages: true,
            logs: true
          }
        },
        messages: { 
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            sender: { select: { id: true, name: true, role: true } }
          }
        },
      },
    });
    console.log('STUDENT Query Succeeded. Count:', resultStudent.length);
  } catch (error) {
    console.error('STUDENT Query Failed with Error:', error.message);
  }

  try {
    console.log('Testing ADMIN query...');
    const resultAdmin = await prisma.project.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 400,
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        createdAt: true,
        amount: true,
        serviceType: true,
        studentId: true,
        freelancerId: true,
        description: true,
        attachments: true,
        student: { select: { id: true, name: true, role: true } },
        freelancer: { select: { id: true, name: true, role: true } },
        subAdmin: { select: { id: true, name: true } },
        orders: { select: { paymentStatus: true } },
        _count: {
          select: {
            messages: true,
            logs: true
          }
        },
        messages: false, // is_admin === true
      },
    });
    console.log('ADMIN Query Succeeded. Count:', resultAdmin.length);
  } catch (error) {
    console.error('ADMIN Query Failed with Error:', error.message);
  }
}

testQuery().catch(console.error).finally(() => prisma.$disconnect());
