import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createNotification } from '@/lib/notify';
import { safeSendEmail, writerApprovedHtml } from '@/lib/emails';

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

    const updatedProfile = await prisma.freelancerProfile.upsert({
      where:  { userId },
      update: { isVerified: true, status: 'Approved' },
      create: { userId, isVerified: true, status: 'Approved' },
    });

    await prisma.user.update({
      where: { id: userId },
      data:  { role: 'FREELANCER' },
    });

    // Fetch writer details for email
    const writer = await prisma.user.findUnique({
      where:  { id: userId },
      select: { name: true, email: true },
    });

    // ── Notification ──
    await createNotification(prisma, {
      userId,
      type:  'account_approved',
      title: '🎉 Account Approved!',
      msg:   'Your writer account has been verified. You can now accept projects.',
      icon:  '✅',
      link:  '/freelancer',
    });

    // ── Email ──
    if (writer?.email) {
      await safeSendEmail({
        to:      writer.email,
        subject: '🎉 Your Express Writer Account is Approved!',
        html:    writerApprovedHtml({ writerName: writer.name || 'Writer' }),
      });
    }

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('Freelancer verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
