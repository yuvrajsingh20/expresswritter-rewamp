import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      projectId 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful
      await prisma.$transaction([
        // 1. Update Order status
        prisma.order.update({
          where: { razorpayId: razorpay_order_id },
          data: { paymentStatus: "PAID" },
        }),
        // 2. Update Project status
        prisma.project.update({
          where: { id: projectId },
          data: { status: "ASSIGNED" }, // Auto-moving to ASSIGNED status for MVP
        }),
        // 3. Create Project Log
        prisma.projectLog.updateMany({
           where: { projectId: projectId }, // Simple way to ensure log exists or just create
           data: { action: "Payment Completed & Project Assigned" }
        })
      ]);

      // Note: In real app, we would also trigger freelancer assignment logic here.

      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
