import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    // User could be authenticated or we might allow unauthenticated if gated.
    // The prompt says "Auth-Gated Next.js Checkout Page", meaning the user MUST be logged in.
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

    const amountInPaise = Math.round(checkoutSession.totalPrice * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${sessionId.slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);

    await prisma.payment.create({
      data: {
        userId: authUser.id,
        razorpayOrderId: order.id,
        amount: checkoutSession.totalPrice,
        currency: "INR",
        status: "created",
        planKey: planKey || "custom",
        planName: planName || "Custom Checkout",
        planDescription: "Direct checkout session payment",
        checkoutSessionId: checkoutSession.id,
      }
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
