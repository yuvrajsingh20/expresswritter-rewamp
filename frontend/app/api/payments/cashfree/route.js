import { NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { getAuthUser } from "@/lib/auth";
import { createPaymentSession, getSessionByIdempotencyKey } from "@/lib/paymentSession";
import prisma from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  serviceType: z.string().optional(),
  attachments: z.array(z.object({ url: z.string(), name: z.string() })).optional(),
  couponCode: z.string().optional(),
  baseAmount: z.number().optional(),
});

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message).join(", ");
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const { amount, idempotencyKey, title, description, deadline, serviceType, attachments, couponCode, baseAmount } = result.data;

    let finalAmount = amount;
    let verifiedPromoId = null;

    // Backend-side double check of coupon to avoid price spoofing
    if (couponCode && baseAmount) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: {
            equals: couponCode.trim(),
            mode: "insensitive"
          }
        }
      });

      if (!promo) {
        return NextResponse.json({ message: "Coupon code does not exist" }, { status: 400 });
      }

      if (!promo.isActive) {
        return NextResponse.json({ message: "Coupon code is inactive" }, { status: 400 });
      }

      if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
        return NextResponse.json({ message: "Coupon code has expired" }, { status: 400 });
      }

      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return NextResponse.json({ message: "Coupon code reached maximum usage" }, { status: 400 });
      }

      if (baseAmount < promo.minOrderValue) {
        return NextResponse.json({ message: "Minimum order value not met for coupon" }, { status: 400 });
      }

      let expectedDiscount = 0;
      if (promo.type === "PERCENTAGE") {
        expectedDiscount = (baseAmount * promo.value) / 100;
      } else if (promo.type === "FIXED") {
        expectedDiscount = promo.value;
      }

      const expectedFinal = Math.max(0, baseAmount - expectedDiscount);

      // Verify that the final checkout amount sent matches within a tiny margin
      if (Math.abs(amount - expectedFinal) > 1.0) {
        return NextResponse.json({ message: "Payment amount verification failed" }, { status: 400 });
      }

      finalAmount = expectedFinal;
      verifiedPromoId = promo.id;
    }

    const existingSession = await getSessionByIdempotencyKey(idempotencyKey);
    if (existingSession) {
      return NextResponse.json({
        cf_order_id: existingSession.razorpayOrderId,
        payment_session_id: existingSession.paymentSessionId,
        order_status: "ACTIVE",
        idempotent: true,
      }, { status: 200 });
    }

    const orderId = `XW_CF_${idempotencyKey.slice(0, 8).toUpperCase()}`;
    let returnUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/student?cf_order_id={order_id}`;
    
    // Cashfree production requires HTTPS return_url
    if (process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" && returnUrl.startsWith("http://")) {
      returnUrl = returnUrl.replace("http://", "https://");
    }

    // Call Cashfree PG to create the order
    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount: finalAmount,
      customer: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
      },
      returnUrl,
    });

    // Save checkout session metadata in Redis using cashfreeOrderId as key
    await createPaymentSession(cashfreeOrder.order_id, {
      idempotencyKey,
      studentId: authUser.id,
      amount: finalAmount,
      title,
      description: description || "",
      deadline: deadline || null,
      serviceType: serviceType || null,
      attachments: attachments || [],
      promoCodeId: verifiedPromoId,
      paymentSessionId: cashfreeOrder.payment_session_id,
    });

    return NextResponse.json(cashfreeOrder, { status: 200 });
  } catch (error) {
    console.error("Cashfree order creation error:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to initiate payment",
      error: error.message 
    }, { status: 500 });
  }
}
