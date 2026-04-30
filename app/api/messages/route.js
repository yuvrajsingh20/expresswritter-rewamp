import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const chatType = searchParams.get('type');

    if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { 
        projectId,
        ...(chatType ? { chatType } : {})
      },
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

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
