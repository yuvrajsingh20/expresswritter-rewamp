import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const authUser = await getAuthUser(req);
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Fetch current profile and user
    const currentProfile = await prisma.freelancerProfile.findUnique({ where: { userId: id } });
    const user = await prisma.user.findUnique({ where: { id } });

    if (!currentProfile || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

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

    // Send email if status changed
    const { dispatchNotification } = require('@/lib/notifications');
    
    if (currentProfile.status === 'Pending Approval' && data.status === 'Active') {
      await dispatchNotification('email', {
        email: user.email,
        subject: 'Application Approved - Express Writer',
        html: `
          <h1>Congratulations ${user.name}!</h1>
          <p>Your application to join Express Writer as a freelancer has been approved.</p>
          <p>You can now log in and start taking orders.</p>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">Login Now</a>
        `
      });
    } else if (currentProfile.status === 'Pending Approval' && data.status === 'Rejected') {
      await dispatchNotification('email', {
        email: user.email,
        subject: 'Application Status - Express Writer',
        html: `
          <h1>Hello ${user.name},</h1>
          <p>Thank you for your interest in Express Writer.</p>
          <p>After reviewing your application, we regret to inform you that we cannot proceed with your application at this time.</p>
          <p>We appreciate your time and wish you the best in your future endeavors.</p>
        `
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Failed to update freelancer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
