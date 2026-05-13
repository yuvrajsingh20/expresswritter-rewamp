import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  projectId: z.string().min(1, "Project ID is required"),
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

    const { amount, projectId } = result.data;

    // Amount in Razorpay is in paisa
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_project_${projectId}`,
    };

    const order = await razorpay.orders.create(options);

    // Update order/project with Razorpay order ID if needed
    // or create a PENDING order record
    await prisma.order.create({
      data: {
        amount: parseFloat(amount),
        paymentStatus: "PENDING",
        razorpayId: order.id,
        projectId: projectId,
        studentId: authUser.id,
      }
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
