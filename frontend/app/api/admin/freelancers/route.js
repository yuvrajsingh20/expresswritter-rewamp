import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { checkPermission } from '@/lib/auth-guards';
import { maskSensitiveData, maskEmail } from '@/lib/mask';
import { computeWriterScore, scoreLabel } from '@/lib/writerScore';

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !checkPermission(authUser, 'freelancer:verify')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const hasEarningsAccess = authUser.role === 'ADMIN' || authUser.permissions?.includes('freelancer:earnings');

    // Return ALL users who have a FreelancerProfile (including pending ones with STUDENT role)
    const [freelancers, allReviews, allSlaEvents] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { role: 'FREELANCER' },
            { freelancerProfile: { isNot: null } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          freelancerProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany(),
      prisma.sLAEvent.findMany()
    ]);

    const hydratedFreelancers = freelancers.map(f => {
      const reviews = allReviews.filter(r => r.freelancerId === f.id);
      const slaEvents = allSlaEvents.filter(e => e.freelancerId === f.id);
      const scoreData = computeWriterScore(reviews, slaEvents);

      const user = {
        ...f,
        slaScore: scoreData.total,
        slaBreakdown: scoreData.breakdown,
        slaLabel: scoreLabel(scoreData.total)
      };

      // Conditionally mask sensitive data for non-financial sub-admins
      if (!hasEarningsAccess) {
        user.email = maskEmail(user.email);
        if (user.freelancerProfile) {
          user.freelancerProfile = {
            ...user.freelancerProfile,
            totalEarnings: undefined,
            preferredPaymentMethod: undefined,
          };
        }
      }

      return user;
    });

    return NextResponse.json(hydratedFreelancers, { status: 200 });
  } catch (error) {
    console.error('Freelancer fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
