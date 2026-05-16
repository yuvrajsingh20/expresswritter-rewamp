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
    
    let project = await prisma.project.findFirst({
      where: {
        id: orderId.replace('XW-', ''), // Basic support for XW prefix
        student: {
          email: email
        }
      },
      include: {
        freelancer: { select: { name: true } },
        logs: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!project) {
      return NextResponse.json({ message: 'Order not found or email mismatch' }, { status: 404 });
    }

    // Map project status to a user-friendly timeline
    const statusMap = {
      'CREATED': 1,
      'PENDING': 2,
      'ASSIGNED': 2,
      'IN_PROGRESS': 3,
      'REVIEW': 4,
      'COMPLETED': 5,
      'DELIVERED': 5
    };

    const currentStep = statusMap[project.status] || 1;

    const timeline = [
      { label: 'Order Placed', date: project.createdAt, done: currentStep >= 1 },
      { label: 'Writer Assigned', date: project.logs.find(l => l.action.includes('ASSIGNED'))?.timestamp || 'Pending', done: currentStep >= 2 },
      { label: 'In Progress', date: project.logs.find(l => l.action.includes('IN_PROGRESS'))?.timestamp || 'Pending', done: currentStep >= 3, active: currentStep === 3 },
      { label: 'Quality Check', date: project.logs.find(l => l.action.includes('REVIEW'))?.timestamp || 'Pending', done: currentStep >= 4, active: currentStep === 4 },
      { label: 'Delivered', date: project.logs.find(l => l.action.includes('DELIVERED'))?.timestamp || 'Pending', done: currentStep >= 5 },
    ];

    return NextResponse.json({
      id: `XW-${project.id.substring(0, 8).toUpperCase()}`,
      service: project.serviceType || project.title,
      status: project.status,
      eta: project.deadline || 'TBD',
      writer: project.freelancer?.name || 'Assigning soon...',
      timeline: timeline
    });

  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
