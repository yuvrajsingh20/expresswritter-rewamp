import { NextResponse } from 'next/server';
import { getAllUsers, updateUserRole, deleteUser } from '@/services/userService';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ message: 'Missing email or role' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create user with a dummy password (they should reset it)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: 'password123', // Admin created
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ message: 'Missing userId or role' }, { status: 400 });
    }

    const updatedUser = await updateUserRole(userId, role);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    await deleteUser(userId);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
