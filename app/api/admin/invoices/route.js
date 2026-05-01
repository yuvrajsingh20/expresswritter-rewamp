import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId, freelancerId, amount, description } = await req.json();

    const invoice = await prisma.freelancerInvoice.create({
      data: {
        projectId,
        freelancerId,
        amount: parseFloat(amount),
        description,
        status: 'PAID' // Assuming admin marks it as paid when creating
      }
    });

    // Log the payout
    await prisma.projectLog.create({
      data: {
        action: `Freelancer payout of ₹${amount} initiated/logged.`,
        projectId: projectId,
        userId: session.user.id
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    const where = {};
    if (projectId) where.projectId = projectId;
    
    // If freelancer, only show their invoices
    if (session.user.role === 'FREELANCER') {
      where.freelancerId = session.user.id;
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const invoices = await prisma.freelancerInvoice.findMany({
      where,
      include: {
        project: { select: { title: true } },
        freelancer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
