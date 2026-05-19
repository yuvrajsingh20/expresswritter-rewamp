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

    const directPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (directPayment) {
      if (directPayment.status === "captured") {
         return NextResponse.json({ message: "Payment already processed", checkoutSessionId: directPayment.checkoutSessionId }, { status: 200 });
      }

      let createdProjectId = null;
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: directPayment.id },
          data: {
            status: "captured",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          }
        });

        if (directPayment.checkoutSessionId) {
          const session = await tx.checkoutSession.update({
            where: { id: directPayment.checkoutSessionId },
            data: { status: "paid" }
          });

          // Create the Project for the checkout session
          const projectTitle = session.services?.length > 0 
            ? session.services.map(s => s.name).join(' & ')
            : "Custom Service Package";

          const projectDesc = `Pre-configured checkout session package.\n\nServices:\n${session.services?.map(s => `- ${s.name} (x${s.quantity}) at ₹${s.price}`).join('\n')}`;

          const createdProject = await tx.project.create({
            data: {
              title: projectTitle,
              description: projectDesc,
              studentId: directPayment.userId,
              amount: directPayment.amount,
              status: "CREATED",
            }
          });

          createdProjectId = createdProject.id;

          await tx.order.create({
            data: {
              amount: directPayment.amount,
              paymentStatus: "PAID",
              razorpayId: razorpay_order_id,
              projectId: createdProject.id,
              studentId: directPayment.userId,
            }
          });

          await tx.projectLog.create({
            data: {
              action: "Payment Completed for Custom Package - Awaiting Admin Assignment",
              projectId: createdProject.id,
              userId: directPayment.userId,
            }
          });
        }
      });

      return NextResponse.json({ 
        message: "Payment verified and session updated", 
        checkoutSessionId: directPayment.checkoutSessionId,
        projectId: createdProjectId 
      }, { status: 200 });
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

    const { studentId, amount, title, description, deadline, serviceType, attachments, promoCodeId } = session;

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

      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: {
            usageCount: {
              increment: 1
            }
          }
        });
      }

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