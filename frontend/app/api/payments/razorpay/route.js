import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { amount, projectId } = await req.json();

    if (!amount || !projectId) {
      return NextResponse.json({ message: "Missing amount or projectId" }, { status: 400 });
    }

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
