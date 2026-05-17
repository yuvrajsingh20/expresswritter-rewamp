import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
      return NextResponse.json({ message: 'Order ID and Email are required' }, { status: 400 });
    }

    // Try to find project by custom ID format (XW-XXXXX) or standard ID
    // Note: If you don't have a custom ID field yet, we search by ID.
    // Standard MongoDB/Prisma IDs are often long strings.
    
    // Fetch all projects for this student's email
    const projects = await prisma.project.findMany({
      where: {
        student: {
          email: email
        }
      },
      include: {
        freelancer: { select: { name: true } },
        logs: { orderBy: { timestamp: 'asc' } }
      }
    });

    const cleanOrderId = orderId.replace('XW-', '').trim().toUpperCase();
    const project = projects.find(p => 
      p.id.slice(-5).toUpperCase() === cleanOrderId || 
      p.id.toUpperCase() === cleanOrderId
    );

    if (!project) {
      return NextResponse.json({ message: 'Order not found or email mismatch' }, { status: 404 });
    }

    // Map project status to a user-friendly timeline
    const statusMap = {
      'CREATED': 1,
      'ASSIGNED': 2,
      'IN_PROGRESS': 3,
      'REVISION': 3,
      'REVIEW': 4,
      'QUALITY_CHECK': 4,
      'UNDER_REVIEW': 4,
      'COMPLETED': 5
    };

    const currentStep = statusMap[project.status] || 1;

    // Helper to find log timestamps or fall back to updatedAt if step is done
    const getStepDate = (stepNum, logQuery) => {
      const log = project.logs.find(l => l.action.includes(logQuery));
      if (log) return log.timestamp;
      if (currentStep >= stepNum) return project.updatedAt;
      return 'Pending';
    };

    const timeline = [
      { label: 'Order Placed', date: project.createdAt, done: currentStep >= 1, active: currentStep === 1 },
      { label: 'Writer Assigned', date: getStepDate(2, 'ASSIGNED'), done: currentStep >= 2, active: currentStep === 2 },
      { label: 'In Progress', date: getStepDate(3, 'IN_PROGRESS'), done: currentStep >= 3, active: currentStep === 3 },
      { label: 'Quality Check', date: getStepDate(4, 'REVIEW') !== 'Pending' ? getStepDate(4, 'REVIEW') : getStepDate(4, 'QUALITY_CHECK'), done: currentStep >= 4, active: currentStep === 4 },
      { label: 'Delivered', date: getStepDate(5, 'COMPLETED'), done: currentStep >= 5, active: currentStep === 5 },
    ];

    return NextResponse.json({
      id: `XW-${project.id.slice(-5).toUpperCase()}`,
      service: project.serviceType || project.title,
      status: project.status === 'COMPLETED' ? 'DELIVERED' : project.status,
      eta: project.deadline || 'TBD',
      writer: project.freelancer?.name || 'Assigning soon...',
      timeline: timeline
    });

  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
