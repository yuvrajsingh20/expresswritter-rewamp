import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
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
    console.error("[GET /api/config/payments]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
