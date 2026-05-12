import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Use upsert to handle the case where FreelancerProfile doesn't exist yet
    const updatedProfile = await prisma.freelancerProfile.upsert({
      where: { userId },
      update: { isVerified: true, status: 'Approved' },
      create: { userId, isVerified: true, status: 'Approved' },
    });

    // Also ensure the user's role is set to FREELANCER
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'FREELANCER' },
    });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('Freelancer verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
