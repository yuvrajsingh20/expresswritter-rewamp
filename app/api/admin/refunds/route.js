import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
      data: { status },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        action: `Updated Refund ${id} status to ${status}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(refund);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
  }
}
