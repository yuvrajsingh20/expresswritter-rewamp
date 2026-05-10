import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const chatType = searchParams.get('type');
    const receiverId = searchParams.get('receiverId');
    const senderId = searchParams.get('senderId');

    const where = {};
    if (projectId) where.projectId = projectId;
    if (chatType) where.chatType = chatType;
    
    // Support for direct messages between two users
    if (senderId && receiverId) {
      where.OR = [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
        // Also include messages sent to "The Admin Team" (null receiver)
        ...(chatType === 'ADMIN_CHAT' ? [
           { senderId, receiverId: null, chatType: 'ADMIN_CHAT' },
           { senderId: receiverId, receiverId: null, chatType: 'ADMIN_CHAT' }
        ] : [])
      ];
    } else if (receiverId) {
      where.receiverId = receiverId;
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId, content, chatType, receiverId } = await req.json();

    const newMessage = await prisma.message.create({
      data: {
        content,
        chatType,
        projectId,
        senderId: session.user.id,
        receiverId: receiverId || null
      },
      include: {
        sender: {
          select: { name: true, image: true }
        }
      }
    });

    try {
      const { createNotification } = require('@/lib/notify');
      let targetUserId = receiverId;

      if (!targetUserId && projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project) {
          if (session.user.id === project.studentId) {
            targetUserId = project.freelancerId;
          } else if (session.user.id === project.freelancerId) {
            targetUserId = project.studentId;
          }
        }
      }

      if (targetUserId) {
        await createNotification(prisma, {
          userId: targetUserId,
          type: 'message',
          title: 'New message',
          msg: `${session.user.name || 'Someone'} sent you a message`,
          icon: '💬',
          link: projectId ? `/dashboard/orders/${projectId}` : `/dashboard/messages`
        });
      }
    } catch (notifyErr) {
      console.error("Message notification error:", notifyErr);
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
