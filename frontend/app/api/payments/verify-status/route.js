import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notify";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ message: "Project ID is required" }, { status: 400 });

    // 1. Fetch project and order details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    const order = project.orders?.[0];
    if (!order) return NextResponse.json({ message: "No payment transaction found for this project" }, { status: 404 });

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ 
        status: "PAID",
        message: "Payment is already marked as successful." 
      }, { status: 200 });
    }

    const razorpayOrderId = order.razorpayId;
    if (!razorpayOrderId) return NextResponse.json({ message: "No Razorpay Order ID found" }, { status: 400 });

    // 2. Fetch payments from Razorpay to check if actually paid
    let isPaid = false;
    try {
      const payments = await razorpay.orders.fetchPayments(razorpayOrderId);
      if (payments && Array.isArray(payments.items)) {
        isPaid = payments.items.some(p => p.status === 'captured' || p.status === 'authorized');
      }
    } catch (rzpErr) {
      console.error("Failed to fetch Razorpay order payments:", rzpErr);
      return NextResponse.json({ message: "Failed to communicate with payment gateway" }, { status: 502 });
    }

    if (isPaid) {
      // 3. Mark as PAID in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID" },
        });

        await tx.project.update({
          where: { id: projectId },
          data: { status: "CREATED" },
        });

        await tx.projectLog.create({
          data: { 
            action: "Payment Verified via Self-Check - Awaiting Admin Assignment",
            projectId: projectId,
            userId: project.studentId
          }
        });
      });

      // 4. Send notifications
      try {
        const admins = await prisma.user.findMany({ 
          where: { role: 'ADMIN' },
          select: { id: true }
        });
        
        for (const admin of admins) {
          await createNotification(prisma, {
            userId: admin.id,
            type: 'payment_received',
            title: 'Payment Verified (Self-Check)',
            msg: `Payment successfully self-checked for "${project.title}"`,
            icon: '💳',
            link: `/admin/orders/${projectId}`
          });
        }
        
        await createNotification(prisma, {
          userId: project.studentId,
          type: 'payment_confirmed',
          title: 'Payment Successful!',
          msg: `Your payment for "${project.title}" has been verified. We will assign a writer soon!`,
          icon: '✅',
          link: `/student/orders/${projectId}`
        });
      } catch (notifyErr) {
        console.error("Selfcheck notification error:", notifyErr);
      }

      return NextResponse.json({
        status: "PAID",
        message: "Payment successfully verified and credited!"
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: "PENDING",
        message: "Payment is still pending. If you completed the transaction, please wait 2-3 minutes or check your bank account."
      }, { status: 200 });
    }

  } catch (error) {
    console.error("Verify status API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
