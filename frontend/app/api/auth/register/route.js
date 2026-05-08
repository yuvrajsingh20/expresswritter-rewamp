import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, hashPassword } from '@/lib/auth';

/**
 * Handle new user registration with PostgreSQL and role-based initial permissions.
 * Standardizes registration for Students and Freelancers.
 */
export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Securely hash the password before persisting
    const hashedPassword = await hashPassword(password);

    // Persist new user with Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT',
      },
    });

    // Generate JWT for the new session
    const token = signToken({ id: user.id, role: user.role, name: user.name });

    const response = NextResponse.json(
      { 
        message: 'Account created successfully', 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie for session persistence
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration processing error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
