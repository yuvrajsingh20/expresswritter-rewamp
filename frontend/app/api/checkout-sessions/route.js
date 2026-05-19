import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    // Ensure only admins can create checkout sessions
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "SUB_ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { services, totalPrice, createdBy, userEmail } = await req.json();

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ message: "Services are required" }, { status: 400 });
    }

    if (totalPrice === undefined || totalPrice < 0) {
      return NextResponse.json({ message: "Valid total price is required" }, { status: 400 });
    }

    const session = await prisma.checkoutSession.create({
      data: {
        services: services.map(s => ({
          name: s.name,
          price: parseFloat(s.price),
          quantity: parseInt(s.quantity) || 1,
        })),
        totalPrice: parseFloat(totalPrice),
        createdBy: createdBy || authUser.name || "Admin",
        userEmail: userEmail || null,
        status: "pending"
      }
    });

    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
