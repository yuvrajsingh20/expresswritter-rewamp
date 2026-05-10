import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, subject, description, orderId, priority } = await request.json();

    const ticketData = {
      type: type || 'Order',
      subject,
      description,
      priority: priority || 'Medium',
      status: 'Open',
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() }
    };

    if (user.id) {
      ticketData.clientId = { $oid: user.id };
    }
    if (orderId) {
      ticketData.orderId = { $oid: orderId };
    }

    const result = await prisma.$runCommandRaw({
      insert: "Ticket",
      documents: [ticketData]
    });

    try {
      const { createNotification } = require('@/lib/notify');
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await createNotification(prisma, {
          userId: admin.id,
          type: 'ticket',
          title: 'New support ticket',
          msg: `New ticket: "${subject}" — Priority: ${priority || 'Medium'}`,
          icon: '🎫',
          link: '/admin/tickets'
        });
      }
    } catch (notifyErr) {
      console.error("Ticket notification error:", notifyErr);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to create ticket via raw command:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
