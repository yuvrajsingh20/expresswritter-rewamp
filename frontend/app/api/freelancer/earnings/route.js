import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch freelancer's currency and admin config
    const freelancer = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { freelancerProfile: true }
    });

    const currencyConfig = await prisma.systemConfig.findUnique({
      where: { key: "CURRENCY_SETTINGS" }
    });

    const userCurrency = freelancer?.freelancerProfile?.currency || 'USD';
    const config = currencyConfig?.value || {};
    
    const FALLBACK_CURRENCIES = [
      { region: 'India', currency: 'INR', symbol: '₹', rate: 83.2 },
      { region: 'United Kingdom', currency: 'GBP', symbol: '£', rate: 0.79 },
      { region: 'United States', currency: 'USD', symbol: '$', rate: 1.0 },
      { region: 'European Union', currency: 'EUR', symbol: '€', rate: 0.92 },
      { region: 'Canada', currency: 'CAD', symbol: 'CA$', rate: 1.37 },
      { region: 'Australia', currency: 'AUD', symbol: 'AU$', rate: 1.53 },
      { region: 'UAE', currency: 'AED', symbol: 'د.إ', rate: 3.67 },
      { region: 'Nigeria', currency: 'NGN', symbol: '₦', rate: 1620 },
    ];

    const activeCurrencies = (config.currencies && config.currencies.length > 0) ? config.currencies : FALLBACK_CURRENCIES;
    const currencyInfo = activeCurrencies.find(c => c.currency === userCurrency) || { rate: 1, symbol: '$' };
    const rate = currencyInfo.rate || 1;
    const symbol = currencyInfo.symbol || '$';

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
      const convertedAmount = inv.amount * rate;
      if (inv.status === 'PAID') {
        totalEarned += convertedAmount;
        balance += convertedAmount;
      } else if (inv.status === 'PENDING') {
        pending += convertedAmount;
      }
      return {
        id: inv.projectId,
        invoiceId: inv.id,
        title: inv.project.title,
        amount: convertedAmount,
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
      amount: pr.amount * rate,
      date: pr.createdAt.toISOString().split('T')[0],
      status: pr.status,
      method: pr.paymentMethod
    }));

    // Subtract past payouts from balance
    const totalPaidOut = payoutRequests
      .filter(pr => pr.status === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.amount, 0) * rate;
      
    balance = Math.max(0, balance - totalPaidOut);

    return NextResponse.json({
      balance: Math.max(0, balance),
      totalEarned,
      pending,
      history,
      projects: projectData,
      currency: userCurrency,
      symbol: symbol
    }, { status: 200 });

  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
