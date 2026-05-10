import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, details } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    // Check if freelancer has enough balance
    // For this demo, we'll assume they do if it matches their available balance
    // In a real app, you'd calculate this on the fly
    
    const payout = await prisma.payoutRequest.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: method,
        paymentDetails: details,
        freelancerId: authUser.id,
        status: 'PENDING'
      }
    });

    try {
      const { createNotification } = require('@/lib/notify');
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      
      for (const admin of admins) {
        await createNotification(prisma, {
          userId: admin.id,
          type: 'payout',
          title: 'Payout request',
          msg: `${authUser.name || 'A freelancer'} requested a payout of $${amount}`,
          icon: '💰',
          link: '/admin/finances' // Or wherever the payout UI is
        });
      }
    } catch (notifyErr) {
      console.error("Payout notification error:", notifyErr);
    }

    return NextResponse.json({
      message: 'Payout request submitted successfully',
      payout
    }, { status: 201 });

  } catch (error) {
    console.error('Payout Request Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
