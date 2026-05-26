import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";

export async function GET(req) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    // Map to include parsed message if it's JSON
    const mappedNotifications = notifications.map(n => {
      let data = {};
      try {
        data = JSON.parse(n.message);
      } catch (e) {
        // Fallback for plain text messages
        data = { 
          msg: n.message,
          title: "Notification",
          type: "system",
          icon: "🔔"
        };
      }
      return {
        id: n.id,
        read: n.read,
        createdAt: n.createdAt,
        time: formatTime(n.createdAt),
        ...data
      };
    });

    return NextResponse.json(mappedNotifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    
    // If specific ID provided, mark only that notification
    if (body?.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId: authUser.id },
        data: { read: true },
      });
    } else {
      // Otherwise mark all as read
      await prisma.notification.updateMany({
        where: { userId: authUser.id, read: false },
        data: { read: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

export async function POST(request) {
  const authUser = await getAuthUser(request);
  if (!authUser || !checkPermission(authUser, "system:config")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, msg, type, title, icon } = await request.json();
    
    const notificationData = JSON.stringify({
      msg,
      type: type || 'system',
      title: title || 'Notification',
      icon: icon || '🔔'
    });

    const notification = await prisma.notification.create({
      data: {
        message: notificationData,
        userId: userId,
      },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// Helper to format time like "2h ago" or "Yesterday"
function formatTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}
