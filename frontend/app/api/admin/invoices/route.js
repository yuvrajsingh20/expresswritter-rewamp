import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";
import { safeSendEmail, payoutProcessedHtml } from "@/lib/emails";
import { createNotification } from "@/lib/notify";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !checkPermission(authUser, 'payment:issue_links')) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { projectId, freelancerId, amount, description } = await req.json();

    const invoice = await prisma.freelancerInvoice.create({
      data: {
        projectId,
        freelancerId,
        amount:      parseFloat(amount),
        description,
        status:      'PAID',
      },
    });

    await prisma.projectLog.create({
      data: {
        action:    `Freelancer payout of ₹${amount} initiated/logged.`,
        projectId,
        userId:    authUser.id,
      },
    });

    // ── Notify and email writer about payout ──
    const writer = await prisma.user.findUnique({
      where:  { id: freelancerId },
      select: { name: true, email: true },
    });

    await createNotification(prisma, {
      userId: freelancerId,
      type:   'payout_processed',
      title:  '💸 Payout Processed!',
      msg:    `Your payout of ₹${amount} has been processed.`,
      icon:   '💰',
      link:   '/freelancer/earnings',
    });

    if (writer?.email) {
      await safeSendEmail({
        to:      writer.email,
        subject: `💸 Payout of ₹${amount} Processed!`,
        html:    payoutProcessedHtml({
          writerName: writer.name || 'Writer',
          amount,
          status:     'COMPLETED',
        }),
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const where = {};
    if (projectId) where.projectId = projectId;

    if (authUser.role === 'FREELANCER') {
      where.freelancerId = authUser.id;
    } else if (authUser.role !== 'ADMIN' && !checkPermission(authUser, 'payment:view_metrics')) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const invoices = await prisma.freelancerInvoice.findMany({
      where,
      include: {
        project:    { select: { title: true } },
        freelancer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
