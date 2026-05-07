import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const authUser = await getAuthUser();
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Update freelancer profile
    const updatedProfile = await prisma.freelancerProfile.update({
      where: { userId: id },
      data: {
        status: data.status,
        isVerified: data.isVerified,
        badge: data.badge,
        // Add more fields as needed
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Failed to update freelancer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
