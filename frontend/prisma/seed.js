const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('test123', 10);
  const now = new Date();

  // Clear existing data to ensure clean seed
  await prisma.message.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.order.deleteMany({});

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

  // Seed SubAdmin (with all available permissions)
  const subAdmin = await prisma.user.upsert({
    where: { email: 'subadmin-expresswritter@yopmail.com' },
    update: {
      role: 'SUB_ADMIN',
      emailVerified: now,
      password,
      permissions: [
        'freelancer:verify',
        'freelancer:earnings',
        'order:read_assigned',
        'order:assign_writer',
        'order:moderate_chat',
        'payment:view_metrics',
        'payment:issue_links',
        'promo:manage',
        'ticket:resolve',
        'system:config',
      ],
    },
    create: {
      email: 'subadmin-expresswritter@yopmail.com',
      name: 'Operations Manager',
      password,
      role: 'SUB_ADMIN',
      emailVerified: now,
      permissions: [
        'freelancer:verify',
        'freelancer:earnings',
        'order:read_assigned',
        'order:assign_writer',
        'order:moderate_chat',
        'payment:view_metrics',
        'payment:issue_links',
        'promo:manage',
        'ticket:resolve',
        'system:config',
      ],
    },
  });

  console.log('SubAdmin seeded:', subAdmin.email);

  // Seed Freelancers
  const freelancers = [
    { email: 'sop-expert@yopmail.com', name: 'Dr. Sarah (SOP Specialist)', skills: ['SOP', 'Academic'] },
    { email: 'lor-expert@yopmail.com', name: 'Prof. Michael (LOR Expert)', skills: ['LOR', 'Business'] },
    { email: 'resume-pro@yopmail.com', name: 'Janice (Resume Writer)', skills: ['RESUME', 'Technical'] },
    { email: 'freelancer-test@yopmail.com', name: 'Test Freelancer', skills: ['SOP', 'LOR', 'RESUME'] },
  ];

  for (const f of freelancers) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: { role: 'FREELANCER', emailVerified: now, password },
      create: { 
        email: f.email, 
        name: f.name, 
        password, 
        role: 'FREELANCER', 
        emailVerified: now 
      },
    });

    await prisma.freelancerProfile.upsert({
      where: { userId: user.id },
      update: { skills: f.skills, isVerified: true },
      create: {
        userId: user.id,
        bio: `Expert in ${f.skills.join(', ')} with 5+ years of experience.`,
        skills: f.skills,
        isVerified: true,
        experience: 5
      }
    });

    console.log(`Freelancer seeded: ${user.email} with skills: ${f.skills.join(', ')}`);
  }

  // Seed Mock Student
  const student = await prisma.user.upsert({
    where: { email: 'student-test@yopmail.com' },
    update: { role: 'STUDENT', emailVerified: now, password },
    create: { 
      email: 'student-test@yopmail.com', 
      name: 'John Doe (Test Student)', 
      password, 
      role: 'STUDENT', 
      emailVerified: now 
    },
  });
  console.log('Student seeded:', student.email);

  // Seed Mock Projects (SOP & LOR)
  const testFreelancer = await prisma.user.findFirst({ where: { email: 'freelancer-test@yopmail.com' } });

  const proj1 = await prisma.project.create({
    data: {
      title: 'Harvard SOP Draft',
      description: 'I need a professional SOP for my Masters in Data Science at Harvard. I have 3 years of experience at Google.',
      serviceType: 'SOP',
      status: 'ASSIGNED',
      studentId: student.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      freelancerId: testFreelancer.id,
      attachments: [
        { name: 'My_Resume.pdf', url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.pdf' }
      ]
    }
  });

  const proj2 = await prisma.project.create({
    data: {
      title: 'Stanford MBA LOR',
      description: 'Requesting a LOR from my professor for my PhD applications.',
      serviceType: 'LOR',
      status: 'IN_PROGRESS',
      studentId: student.id,
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      freelancerId: testFreelancer.id,
    }
  });

  const proj3 = await prisma.project.create({
    data: {
      title: 'MIT Technical Resume',
      description: 'Update my resume for Big Tech roles.',
      serviceType: 'RESUME',
      status: 'COMPLETED',
      studentId: student.id,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      freelancerId: testFreelancer.id,
    }
  });

  console.log('Projects seeded:', proj1.title, ',', proj2.title);

  // Seed Mock Messages
  const welcomeMsg = await prisma.message.create({
    data: {
      content: 'Hello John! I am Sarah, your SOP specialist. I have received your resume and started working on your Harvard draft. Do you have any specific points you want me to highlight about your tenure at Google?',
      chatType: 'CLIENT_CHAT',
      senderId: proj1.freelancerId,
      receiverId: student.id,
      projectId: proj1.id
    }
  });

  const studentReply = await prisma.message.create({
    data: {
      content: 'Hi Sarah, yes! Please focus on the cross-functional team leadership role I played in the Cloud infrastructure project.',
      chatType: 'CLIENT_CHAT',
      senderId: student.id,
      receiverId: proj1.freelancerId,
      projectId: proj1.id
    }
  });

  console.log('Messages seeded for project:', proj1.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
