import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Return projects that are not yet assigned to any freelancer
    const availableProjects = await prisma.project.findMany({
      where: {
        freelancerId: null,
        status: 'CREATED'
      },
      include: {
        student: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(availableProjects, { status: 200 });
  } catch (error) {
    console.error('Available projects fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
