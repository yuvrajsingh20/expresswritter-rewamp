import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification } from "@/lib/notify";
import { safeSendEmail, newTicketAdminHtml } from "@/lib/emails";

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, subject, description, orderId, priority } = await request.json();

    const ticketData = {
      type:        type || 'Order',
      subject,
      description,
      priority:    priority || 'Medium',
      status:      'Open',
      createdAt:   { $date: new Date().toISOString() },
      updatedAt:   { $date: new Date().toISOString() },
    };

    if (user.id)   ticketData.clientId = { $oid: user.id };
    if (orderId)   ticketData.orderId  = { $oid: orderId };

    const result = await prisma.$runCommandRaw({
      insert:    "Ticket",
      documents: [ticketData],
    });

    // ── Notifications + Emails to all admins ──
    const admins = await prisma.user.findMany({
      where:  { role: 'ADMIN' },
      select: { id: true, email: true },
    });

    for (const admin of admins) {
      await createNotification(prisma, {
        userId: admin.id,
        type:   'ticket',
        title:  'New support ticket',
        msg:    `New ticket: "${subject}" — Priority: ${priority || 'Medium'}`,
        icon:   '🎫',
        link:   '/admin/tickets',
      });

      if (admin.email) {
        await safeSendEmail({
          to:      admin.email,
          subject: `🎫 New ${priority || 'Medium'} Priority Ticket: ${subject}`,
          html:    newTicketAdminHtml({
            subject,
            priority:    priority || 'Medium',
            submittedBy: user.name || user.email || 'A user',
            ticketType:  type || 'Order',
          }),
        });
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
