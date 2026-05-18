import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser || !['ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Fetch current profile and user
    const currentProfile = await prisma.freelancerProfile.findUnique({ where: { userId: id } });
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Upsert freelancer profile (create if doesn't exist)
    const updatedProfile = await prisma.freelancerProfile.upsert({
      where: { userId: id },
      update: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
        ...(data.availability !== undefined && { availability: data.availability }),
        ...(data.rejectionReason !== undefined && { rejectionReason: data.rejectionReason }),
      },
      create: {
        userId: id,
        status: data.status || 'Pending Approval',
        isVerified: data.isVerified || false,
        availability: data.availability !== undefined ? data.availability : true,
        rejectionReason: data.rejectionReason || null,
      }
    });

    // Upgrade user role to FREELANCER when approved
    if (data.status === 'Active' || data.isVerified === true) {
      await prisma.user.update({
        where: { id },
        data: { role: 'FREELANCER' },
      });
    }

    // Send email notification (non-blocking — don't crash if it fails)
    try {
      const { dispatchNotification } = require('@/lib/notifications');
      const prevStatus = currentProfile?.status;
      
      if (prevStatus === 'Pending Approval' && data.status === 'Active') {
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
      } else if (prevStatus === 'Pending Approval' && data.status === 'Rejected') {
        const reason = data.rejectionReason || "Your application did not meet our current requirements.";
        await dispatchNotification('email', {
          email: user.email,
          subject: 'Application Status - Express Writer',
          html: `
            <h1>Hello ${user.name},</h1>
            <p>Thank you for your interest in Express Writer.</p>
            <p>After reviewing your application, we regret to inform you that we cannot proceed at this time.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong style="color: #475569; font-size: 14px; text-transform: uppercase;">Reason for Rejection:</strong>
              <p style="color: #64748b; margin-top: 8px;">${reason}</p>
            </div>
            <p>We appreciate your time and wish you the best in your future endeavors.</p>
          `
        });
      }
    } catch (emailErr) {
      console.warn('Email notification failed (non-fatal):', emailErr.message);
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Failed to update freelancer:', error);
    return NextResponse.json({ message: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
