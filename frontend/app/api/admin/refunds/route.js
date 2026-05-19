import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { safeSendEmail, refundStatusHtml } from "@/lib/emails";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const refunds = await prisma.refundRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(refunds);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    const refund = await prisma.refundRequest.update({
      where: { id },
      data:  { status },
    });

    await prisma.auditLog.create({
      data: {
        userId:    session.user.id,
        userName:  session.user.name,
        action:    `Updated Refund ${id} status to ${status}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    // ── Email the student about refund status ──
    const student = await prisma.user.findUnique({
      where:  { id: refund.userId },
      select: { name: true, email: true },
    });

    if (student?.email) {
      await safeSendEmail({
        to:      student.email,
        subject: `Refund ${status} — Order XW-${refund.orderId.slice(-5).toUpperCase()}`,
        html:    refundStatusHtml({
          name:    student.name || 'Student',
          status,
          amount:  refund.amount,
          orderId: refund.orderId,
        }),
      });
    }

    return NextResponse.json(refund);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
  }
}
