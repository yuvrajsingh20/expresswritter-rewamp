import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key: "PAYMENT_GATEWAYS" }
    });

    if (config && config.value) {
      return NextResponse.json(config.value);
    } else {
      // Default fallback
      return NextResponse.json({ razorpay: true, cashfree: true });
    }
  } catch (error) {
    console.error("[GET /api/admin/config/payments]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const config = await prisma.systemConfig.upsert({
      where: { key: "PAYMENT_GATEWAYS" },
      update: { value: body },
      create: { key: "PAYMENT_GATEWAYS", value: body }
    });

    return NextResponse.json(config.value);
  } catch (error) {
    console.error("[POST /api/admin/config/payments]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
