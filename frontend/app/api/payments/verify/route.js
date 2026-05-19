import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getAndDeletePaymentSession } from "@/lib/paymentSession";
import { createNotification } from "@/lib/notify";
import { safeSendEmail, paymentConfirmedHtml } from "@/lib/emails";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const session = await getAndDeletePaymentSession(razorpay_order_id);

    if (!session) {
      const existingOrder = await prisma.order.findFirst({
        where: { razorpayId: razorpay_order_id },
      });

      if (existingOrder && existingOrder.paymentStatus === "PAID") {
        return NextResponse.json({ 
          message: "Payment already processed",
          projectId: existingOrder.projectId,
        }, { status: 200 });
      }

      return NextResponse.json({ 
        message: "Payment session expired or not found" 
      }, { status: 409 });
    }

    const { studentId, amount, title, description, deadline, serviceType, attachments } = session;

    const project = await prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          title,
          description,
          deadline: deadline ? new Date(deadline) : null,
          studentId,
          serviceType,
          amount,
          attachments: attachments || [],
          status: "CREATED",
        },
      });

      await tx.order.create({
        data: {
          amount: parseFloat(amount),
          paymentStatus: "PAID",
          razorpayId: razorpay_order_id,
          projectId: createdProject.id,
          studentId,
        },
      });

      await tx.projectLog.create({
        data: {
          action: "Payment Completed - Awaiting Admin Assignment",
          projectId: createdProject.id,
          userId: studentId,
        },
      });

      return createdProject;
    });

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });

    for (const admin of admins) {
      await createNotification(prisma, {
        userId: admin.id,
        type: 'payment_received',
        title: 'Payment Received',
        msg: `Payment received for "${project.title}" — Ready for writer assignment`,
        icon: '💳',
        link: `/admin/projects/${project.id}`,
      });
    }

    await createNotification(prisma, {
      userId: studentId,
      type: 'payment_confirmed',
      title: 'Payment Successful!',
      msg: `Your payment for "${project.title}" has been received. We'll assign a writer soon!`,
      icon: '✅',
      link: `/student/orders/${project.id}`,
    });

    if (student?.email) {
      await safeSendEmail({
        to: student.email,
        subject: `✅ Payment Confirmed — ${project.title}`,
        html: paymentConfirmedHtml({
          name: student.name || 'Student',
          orderId: project.id,
          projectTitle: project.title,
          amount: amount || 0,
          deadline: project.deadline,
        }),
      });
    }

    return NextResponse.json({
      message: "Payment verified and project initialized",
      projectId: project.id,
    }, { status: 200 });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}