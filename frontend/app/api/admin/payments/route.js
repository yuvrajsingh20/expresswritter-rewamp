import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { checkPermission } from '@/lib/auth-guards';

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !checkPermission(authUser, 'payment:view_metrics')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        project: {
          select: {
            title: true,
            serviceType: true,
          }
        },
        student: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
