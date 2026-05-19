import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getAuthUser } from "@/lib/auth";
import { createPaymentSession, getSessionByIdempotencyKey } from "@/lib/paymentSession";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  serviceType: z.string().optional(),
  attachments: z.array(z.object({ url: z.string(), name: z.string() })).optional(),
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

    const { amount, idempotencyKey, title, description, deadline, serviceType, attachments } = result.data;

    const existingSession = await getSessionByIdempotencyKey(idempotencyKey);
    if (existingSession) {
      return NextResponse.json({
        id: existingSession.razorpayOrderId,
        amount: existingSession.amount * 100,
        currency: "INR",
        idempotent: true,
      }, { status: 200 });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${idempotencyKey.slice(0, 8)}`,
    };

    const order = await razorpay.orders.create(options);

    await createPaymentSession(order.id, {
      idempotencyKey,
      studentId: authUser.id,
      amount,
      title,
      description: description || "",
      deadline: deadline || null,
      serviceType: serviceType || null,
      attachments: attachments || [],
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}