import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Return ALL users who have a FreelancerProfile (including pending ones with STUDENT role)
    const freelancers = await prisma.user.findMany({
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
    });

    return NextResponse.json(freelancers, { status: 200 });
  } catch (error) {
    console.error('Freelancer fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
