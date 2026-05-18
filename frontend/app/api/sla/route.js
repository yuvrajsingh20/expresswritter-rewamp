import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, eventType } = await request.json();
    if (!projectId || !eventType) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Check if an event of this type already exists for this project (e.g. ASSIGN_ACCEPT should only happen once)
    const existing = await prisma.sLAEvent.findFirst({
      where: { projectId, eventType }
    });

    if (existing) {
      return NextResponse.json({ message: 'Event already logged', existing });
    }

    const now = new Date();
    
    const sla = await prisma.sLAEvent.create({
      data: {
        projectId,
        freelancerId: project.freelancerId || '',
        eventType,
        occurredAt: now,
        deadlineAt: project.deadline,
        // Optional deltas can be computed offline or if assignedAt exists in the future
      }
    });

    return NextResponse.json(sla);
  } catch (error) {
    console.error('SLA logging error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
