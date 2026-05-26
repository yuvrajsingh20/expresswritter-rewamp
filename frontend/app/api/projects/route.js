import { NextResponse } from 'next/server';
import { createProject, getProjectsByUser } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';

/**
 * Core Project and Task Management API with Built-in Role Filtering.
 */
export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    // Only Student can create, or Admin/SubAdmin on behalf of a student.
    if (!authUser || !['STUDENT', 'ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Persist to PostgreSQL via Project Service
    const project = await createProject({
      ...data,
      studentId: data.studentId || authUser.id, // Direct order or Admin-created
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation failure:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    console.log('[API /projects] Auth user:', authUser);
    
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // For admin and subadmin, fetch all projects directly with simpler query
    if (authUser.role === 'ADMIN' || authUser.role === 'SUB_ADMIN') {
      const prisma = (await import('@/lib/prisma')).default;
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 400,
        include: {
          student: { select: { id: true, name: true, role: true } },
          freelancer: { select: { id: true, name: true, role: true } },
          orders: { select: { paymentStatus: true } },
        },
      });
      console.log('[API /projects] Admin projects count:', projects?.length || 0);
      return NextResponse.json(projects, { status: 200 });
    }

    const projects = await getProjectsByUser(authUser.id, authUser.role);
    console.log('[API /projects] Projects count:', projects?.length || 0);

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Project retrieval failure:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message, stack: error.stack }, { status: 500 });
  }
}
