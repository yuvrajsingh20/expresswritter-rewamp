import { NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { planKey, planName, priceText, userId, sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
    }

    const checkoutSession = await prisma.checkoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!checkoutSession) {
      return NextResponse.json({ message: "Checkout session not found" }, { status: 404 });
    }

    if (checkoutSession.status === "paid") {
      return NextResponse.json({ message: "Session already paid" }, { status: 400 });
    }

    // Cashfree order parameters
    const orderId = `XW_CF_CS_${sessionId.slice(-6).toUpperCase()}_${Date.now().toString().slice(-4)}`;
    let returnUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/student?cf_order_id={order_id}`;

    // Cashfree production requires HTTPS return_url
    if (process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" && returnUrl.startsWith("http://")) {
      returnUrl = returnUrl.replace("http://", "https://");
    }

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount: checkoutSession.totalPrice,
      customer: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
      },
      returnUrl,
    });

    // Save pending Payment record in prisma database
    await prisma.payment.create({
      data: {
        userId: authUser.id,
        cashfreeOrderId: cashfreeOrder.order_id,
        amount: checkoutSession.totalPrice,
        currency: "INR",
        status: "created",
        planKey: planKey || "custom",
        planName: planName || "Custom Checkout",
        planDescription: "Direct checkout session payment",
        checkoutSessionId: checkoutSession.id,
      }
    });

    return NextResponse.json(cashfreeOrder, { status: 200 });
  } catch (error) {
    console.error("Cashfree order creation error:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to initiate payment", 
      error: error.message,
    }, { status: 500 });
  }
}
