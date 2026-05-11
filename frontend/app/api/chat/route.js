import { NextResponse } from 'next/server';
import { sendMessage, getMessagesByProject } from '@/services/chatService';
import { getAuthUser } from '@/lib/auth';

/**
 * Multi-layer chat API. Handles persistence and retrieval for:
 * - CLIENT_CHAT
 * - INTERNAL_CHAT
 * - ADMIN_CHAT
 */
export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    // Persist to PostgreSQL via Chat Service
    const message = await sendMessage({
      ...data,
      senderId: authUser.id,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Chat persistence error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const chatType = searchParams.get('chatType');

    if (!projectId || !chatType) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const messages = await getMessagesByProject(projectId, chatType);
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Chat retrieval error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
