import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { projectId, qualityScore, communicationScore, timelinessScore, requirementScore, overallScore, comment } = body;

    if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const existingReview = await prisma.review.findUnique({
      where: { projectId: projectId }
    });

    if (existingReview) return NextResponse.json({ error: 'Review already submitted' }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        projectId,
        studentId: user.id,
        freelancerId: project.freelancerId || '',
        qualityScore: parseInt(qualityScore) || 5,
        communicationScore: parseInt(communicationScore) || 5,
        timelinessScore: parseInt(timelinessScore) || 5,
        requirementScore: parseInt(requirementScore) || 5,
        overallScore: parseInt(overallScore) || 5,
        comment: comment || null
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return NextResponse.json([], { status: 200 });

    const review = await prisma.review.findUnique({
      where: { projectId: projectId }
    });

    return NextResponse.json(review ? [review] : []);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
