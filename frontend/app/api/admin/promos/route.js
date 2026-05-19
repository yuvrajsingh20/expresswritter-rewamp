import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const promo = await prisma.promoCode.create({
      data: {
        code: data.code,
        type: data.type,
        value: parseFloat(data.value),
        minOrderValue: parseFloat(data.minOrderValue || 0),
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        action: `Created Promo Code: ${data.code}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(promo);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
