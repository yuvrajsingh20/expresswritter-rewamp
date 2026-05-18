import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notify';
import { safeSendEmail, payoutRequestedHtml } from '@/lib/emails';

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, details } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        amount:         parseFloat(amount),
        paymentMethod:  method,
        paymentDetails: details,
        freelancerId:   authUser.id,
        status:         'PENDING',
      },
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });

    for (const admin of admins) {
      await createNotification(prisma, {
        userId: admin.id,
        type:   'payout',
        title:  'Payout request',
        msg:    `${authUser.name || 'A writer'} requested a payout of ₹${amount}`,
        icon:   '💰',
        link:   '/admin/finances',
      });
    }

    // ── Confirmation Email to Writer ──
    const writer = await prisma.user.findUnique({
      where:  { id: authUser.id },
      select: { name: true, email: true },
    });

    if (writer?.email) {
      await safeSendEmail({
        to:      writer.email,
        subject: `💰 Payout Request Received — ₹${amount}`,
        html:    payoutRequestedHtml({
          writerName: writer.name || 'Writer',
          amount,
          method:     method || 'Not specified',
        }),
      });
    }

    return NextResponse.json({
      message: 'Payout request submitted successfully',
      payout,
    }, { status: 201 });

  } catch (error) {
    console.error('Payout Request Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
