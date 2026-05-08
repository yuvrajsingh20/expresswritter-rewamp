import { NextResponse } from 'next/server';
import { getProjectById, updateProject } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (authUser.role === 'STUDENT' && project.studentId.toString() !== authUser.id.toString()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const updated = await updateProject(id, body, authUser.id);
    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
