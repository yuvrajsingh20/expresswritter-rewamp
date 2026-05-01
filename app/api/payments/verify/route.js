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
      // 1. Fetch project to get service type
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { serviceType: true, title: true, studentId: true }
      });

      await prisma.$transaction(async (tx) => {
        // 3. Update Order status
        await tx.order.update({
          where: { razorpayId: razorpay_order_id },
          data: { paymentStatus: "PAID" },
        });

        // 4. Update Project status
        await tx.project.update({
          where: { id: projectId },
          data: { 
            status: "CREATED",
          },
        });

        // 5. Create Project Log
        await tx.projectLog.create({
          data: { 
            action: "Payment Completed - Awaiting Admin Assignment",
            projectId: projectId,
            userId: project.studentId
          }
        });
      });

      return NextResponse.json({ 
        message: "Payment verified and project initialized",
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
