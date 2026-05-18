import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notify";
import { safeSendEmail, paymentConfirmedHtml } from "@/lib/emails";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      projectId,
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

    // Fetch project + student
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: { razorpayId: razorpay_order_id },
      });

      if (existingOrder) {
        await tx.order.update({
          where: { id: existingOrder.id },
          data: { paymentStatus: "PAID" },
        });
      } else {
        await tx.order.create({
          data: {
            amount:        parseFloat(project.amount || 0),
            paymentStatus: "PAID",
            razorpayId:    razorpay_order_id,
            projectId,
            studentId:     project.studentId,
          },
        });
      }

      await tx.project.update({
        where: { id: projectId },
        data:  { status: "CREATED" },
      });

      await tx.projectLog.create({
        data: {
          action:    "Payment Completed - Awaiting Admin Assignment",
          projectId,
          userId:    project.studentId,
        },
      });
    });

    // ── Notifications ──
    const admins = await prisma.user.findMany({
      where:  { role: 'ADMIN' },
      select: { id: true, email: true },
    });

    for (const admin of admins) {
      await createNotification(prisma, {
        userId: admin.id,
        type:   'payment_received',
        title:  'Payment Received',
        msg:    `Payment received for "${project.title}" — Ready for writer assignment`,
        icon:   '💳',
        link:   `/admin/projects/${projectId}`,
      });
    }

    await createNotification(prisma, {
      userId: project.studentId,
      type:   'payment_confirmed',
      title:  'Payment Successful!',
      msg:    `Your payment for "${project.title}" has been received. We'll assign a writer soon!`,
      icon:   '✅',
      link:   `/student/orders/${projectId}`,
    });

    // ── Payment Confirmation Email to Student ──
    const student = project.student;
    if (student?.email) {
      await safeSendEmail({
        to:      student.email,
        subject: `✅ Payment Confirmed — ${project.title}`,
        html:    paymentConfirmedHtml({
          name:         student.name || 'Student',
          orderId:      projectId,
          projectTitle: project.title,
          amount:       project.amount || 0,
          deadline:     project.deadline,
        }),
      });
    }

    return NextResponse.json({
      message: "Payment verified and project initialized",
    }, { status: 200 });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
