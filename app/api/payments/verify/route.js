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

      // 2. Auto-Assignment Logic (Phase 1: Simple Skill Match)
      // Look for a freelancer who has the matching serviceType in their skills
      const matchedFreelancer = await prisma.freelancerProfile.findFirst({
        where: {
          skills: { has: project.serviceType || 'Academic' },
          availability: true,
          isVerified: true
        },
        include: { user: true }
      });

      const freelancerId = matchedFreelancer ? matchedFreelancer.userId : null;

      await prisma.$transaction(async (tx) => {
        // 3. Update Order status
        await tx.order.update({
          where: { razorpayId: razorpay_order_id },
          data: { paymentStatus: "PAID" },
        });

        // 4. Update Project status and assign freelancer
        await tx.project.update({
          where: { id: projectId },
          data: { 
            status: freelancerId ? "ASSIGNED" : "CREATED",
            freelancerId: freelancerId
          },
        });

        // 5. Create Project Log
        await tx.projectLog.create({
          data: { 
            action: freelancerId 
              ? `Payment Completed & Auto-Assigned to ${matchedFreelancer.user.name}` 
              : "Payment Completed - Dynamic Assignment Pending",
            projectId: projectId,
            userId: project.studentId // Action logged against student's payment
          }
        });

        // 6. Initialize Chat Room (Step 3 & 5)
        if (freelancerId) {
          const serviceName = project.serviceType || "Project";
          await tx.message.create({
            data: {
              content: `Hello! I am ${matchedFreelancer.user.name}, your assigned specialist for this ${serviceName} project. I've reviewed your brief and will begin the draft immediately. Feel free to share any additional context here.`,
              chatType: "CLIENT_CHAT",
              senderId: freelancerId,
              receiverId: project.studentId,
              projectId: projectId
            }
          });
        }
      });

      return NextResponse.json({ 
        message: "Payment verified and project initialized",
        assigned: !!freelancerId
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
