import { NextResponse } from 'next/server';
import { createProject, getProjectsByUser } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';

/**
 * Core Project and Task Management API with Built-in Role Filtering.
 */
export async function POST(req) {
  try {
    const authUser = await getAuthUser();
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
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const projects = await getProjectsByUser(authUser.id, authUser.role);
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Project retrieval failure:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
