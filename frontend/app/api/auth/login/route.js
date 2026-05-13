import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, comparePassword } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';

/**
 * Handle application authentication for existing users via PostgreSQL and bcrypt comparison.
 * Implements standard Next.js API route session delivery.
 */
export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { email, password } = await req.json();

    // Retrieve user by unique email with Prisma
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Securely compare provided password with stored hash
    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials provided' }, { status: 401 });
    }

    // Refresh JWT session token
    const token = signToken({ id: user.id, role: user.role, name: user.name });

    const response = NextResponse.json(
      { 
        message: 'Identity verified successfully', 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      },
      { status: 200 }
    );

    // Refresh HTTP-only session cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Authentication attempt failure:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
