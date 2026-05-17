import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notify";

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
      // 1. Fetch project to get details
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { serviceType: true, title: true, studentId: true, amount: true }
      });

      if (!project) {
        console.error("Project not found during verification:", projectId);
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        // 2. Find if order already exists
        const existingOrder = await tx.order.findFirst({
          where: { razorpayId: razorpay_order_id }
        });

        if (existingOrder) {
          // 3. Update Order status
          await tx.order.update({
            where: { id: existingOrder.id },
            data: { paymentStatus: "PAID" },
          });
        } else {
          // 3b. Create Order status on the fly if missing
          await tx.order.create({
            data: {
              amount: parseFloat(project.amount || 0),
              paymentStatus: "PAID",
              razorpayId: razorpay_order_id,
              projectId: projectId,
              studentId: project.studentId,
            }
          });
        }

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

      // 6. Send payment notifications
      try {
        const admins = await prisma.user.findMany({ 
          where: { role: 'ADMIN' },
          select: { id: true }
        });
        
        // Notify admins of payment received
        for (const admin of admins) {
          await createNotification(prisma, {
            userId: admin.id,
            type: 'payment_received',
            title: 'Payment Received',
            msg: `Payment received for "${project.title}" - Ready for writer assignment`,
            icon: '💳',
            link: `/admin/orders/${projectId}`
          });
        }
        
        // Notify student of successful payment (receipt)
        await createNotification(prisma, {
          userId: project.studentId,
          type: 'payment_confirmed',
          title: 'Payment Successful!',
          msg: `Your payment for "${project.title}" has been received. We'll assign a writer soon!`,
          icon: '✅',
          link: `/student/orders/${projectId}`
        });
      } catch (notifyErr) {
        console.error("Payment notification error:", notifyErr);
      }

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
