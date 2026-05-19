import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
    }

    const session = await prisma.checkoutSession.findUnique({
      where: { id }
    });

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Get checkout session error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
