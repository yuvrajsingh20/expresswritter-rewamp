import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all invoices for this freelancer
    const invoices = await prisma.freelancerInvoice.findMany({
      where: { freelancerId: authUser.id },
      include: {
        project: { select: { title: true, status: true, updatedAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalEarned = 0;
    let pending = 0;
    let balance = 0;

    const projectData = invoices.map(inv => {
      if (inv.status === 'PAID') {
        totalEarned += inv.amount;
        balance += inv.amount;
      } else if (inv.status === 'PENDING') {
        pending += inv.amount;
      }
      return {
        id: inv.projectId,
        invoiceId: inv.id,
        title: inv.project.title,
        amount: inv.amount,
        status: inv.status,
        date: inv.createdAt
      };
    });

    // Fetch real payout history
    const payoutRequests = await prisma.payoutRequest.findMany({
      where: { freelancerId: authUser.id },
      orderBy: { createdAt: 'desc' }
    });

    const history = payoutRequests.map(pr => ({
      id: pr.id.toString().slice(-8).toUpperCase(),
      amount: pr.amount,
      date: pr.createdAt.toISOString().split('T')[0],
      status: pr.status,
      method: pr.paymentMethod
    }));

    // Subtract past payouts from balance
    const totalPaidOut = payoutRequests
      .filter(pr => pr.status === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    balance = Math.max(0, balance - totalPaidOut);

    return NextResponse.json({
      balance: Math.max(0, balance),
      totalEarned,
      pending,
      history,
      projects: projectData
    }, { status: 200 });

  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
