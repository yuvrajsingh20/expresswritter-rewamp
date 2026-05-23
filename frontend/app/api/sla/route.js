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

    if (existing && eventType !== 'FIRST_REPLY') {
      return NextResponse.json({ message: 'Event already logged', existing });
    }

    const now = new Date();
    
    // Dynamically calculate reference dates and deltas based on SLA eventType
    let assignedAt = null;
    let startMinutes = null;
    let responseMinutes = null;
    let deliveryOnTime = null;
    let revisionMinutes = null;

    if (eventType === 'ASSIGN_ACCEPT') {
      // Find the project log recording the assignment
      const assignmentLog = await prisma.projectLog.findFirst({
        where: {
          projectId,
          action: { startsWith: 'Project assigned to' }
        },
        orderBy: { createdAt: 'desc' }
      });
      assignedAt = assignmentLog ? assignmentLog.createdAt : project.createdAt;
      
      const elapsedMinutes = Math.max(0, Math.round((now.getTime() - new Date(assignedAt).getTime()) / (1000 * 60)));
      startMinutes = elapsedMinutes;
    } else if (eventType === 'FIRST_REPLY') {
      // Calculate average response time across ALL client messages
      const clientMsgs = await prisma.message.findMany({
        where: { projectId, senderId: project.studentId },
        orderBy: { createdAt: 'asc' }
      });
      const writerMsgs = await prisma.message.findMany({
        where: { projectId, senderId: project.freelancerId },
        orderBy: { createdAt: 'asc' }
      });
      
      let totalMins = 0;
      let replyCount = 0;
      
      for (const cm of clientMsgs) {
        // Find the first writer message that came AFTER this client message
        const firstReply = writerMsgs.find(wm => new Date(wm.createdAt) > new Date(cm.createdAt));
        if (firstReply) {
          const mins = Math.max(0, Math.round((new Date(firstReply.createdAt).getTime() - new Date(cm.createdAt).getTime()) / (1000 * 60)));
          totalMins += mins;
          replyCount++;
        }
      }
      
      if (replyCount > 0) {
        responseMinutes = Math.round(totalMins / replyCount);
      } else {
        responseMinutes = 0; // If the writer sends a message before the client, 0 mins response time
      }
      
      if (existing) {
        // Update the existing SLA record with the new rolling average
        const updated = await prisma.sLAEvent.update({
          where: { id: existing.id },
          data: { responseMinutes, occurredAt: now }
        });
        return NextResponse.json(updated);
      }
    } else if (eventType === 'DELIVERY') {
      deliveryOnTime = project.deadline ? now <= new Date(project.deadline) : true;
    } else if (eventType === 'REVISION_TURNAROUND') {
      // Find latest status transition or status log to REVISION
      const revisionLog = await prisma.projectLog.findFirst({
        where: {
          projectId,
          action: { contains: 'status' }
        },
        orderBy: { createdAt: 'desc' }
      });
      const revisionRequestedAt = revisionLog ? revisionLog.createdAt : project.updatedAt;
      revisionMinutes = Math.max(0, Math.round((now.getTime() - new Date(revisionRequestedAt).getTime()) / (1000 * 60)));
    }

    const sla = await prisma.sLAEvent.create({
      data: {
        projectId,
        freelancerId: project.freelancerId || '',
        eventType,
        occurredAt: now,
        deadlineAt: project.deadline,
        assignedAt,
        startMinutes,
        responseMinutes,
        deliveryOnTime,
        revisionMinutes
      }
    });

    return NextResponse.json(sla);
  } catch (error) {
    console.error('SLA logging error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
