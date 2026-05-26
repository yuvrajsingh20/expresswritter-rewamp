import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, hashPassword } from '@/lib/auth';
import { safeSendEmail, welcomeHtml } from '@/lib/emails';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Only allow STUDENT role via public registration (prevents privilege escalation)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'STUDENT' },
    });

    const token = signToken({ id: user.id, role: user.role, name: user.name });

    // ── Welcome Email ──
    await safeSendEmail({
      to:      email,
      subject: `🎉 Welcome to Express Writer, ${name}!`,
      html:    welcomeHtml({ name, role: user.role }),
    });

    const response = NextResponse.json(
      { message: 'Account created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   30 * 24 * 60 * 60,
      path:     '/',
    });

    return response;
  } catch (error) {
    console.error('Registration processing error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
