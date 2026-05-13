import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    // 1. Authentication Check
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // 2. Max File Size Check (5MB for Base64 safety)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File size exceeds limit of 5MB for direct database storage' }, { status: 400 });
    }

    // 3. File Type Validation
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isDoc = file.type === 'application/msword';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    const extension = file.name.split('.').pop().toLowerCase();
    const isAllowedExt = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'].includes(extension);
    
    if (!isImage && !isPdf && !isDoc && !isDocx && !isAllowedExt) {
      return NextResponse.json({ message: 'Invalid file type. Only PDF, DOC, DOCX and images are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to Base64 Data URL for direct storage in the database
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    console.log('Specialist Console: Converting file to Data URL for direct DB storage:', file.name);

    return NextResponse.json({
      url: dataUrl,
      name: file.name
    }, { status: 200 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
        message: 'Direct data conversion failed', 
        error: error.message 
    }, { status: 500 });
  }
}
