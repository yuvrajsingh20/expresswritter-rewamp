import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const freelancers = await prisma.user.findMany({
      where: { role: 'FREELANCER' },
      select: {
        id: true,
        name: true,
        email: true,
        freelancerProfile: true,
      },
    });

    return NextResponse.json(freelancers, { status: 200 });
  } catch (error) {
    console.error('Freelancer fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
