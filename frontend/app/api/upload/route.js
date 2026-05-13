import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
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

    // 2. Max File Size Check (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File size exceeds limit of 10MB' }, { status: 400 });
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
    
    // Convert to Base64 for Cloudinary Compatibility
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    console.log('Specialist Console: Initiating Cloudinary upload for', file.name);

    try {
        const uploadResponse = await cloudinary.uploader.upload(base64File, {
            resource_type: 'auto',
            folder: 'express-writer/deliverables'
        });

        console.log('Cloudinary upload success:', uploadResponse.secure_url);

        return NextResponse.json({
          url: uploadResponse.secure_url,
          name: file.name
        }, { status: 200 });
    } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return NextResponse.json({ 
            message: 'Cloudinary upload failed', 
            error: uploadError.message 
        }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
        message: 'Upload failed', 
        error: error.message 
    }, { status: 500 });
  }
}
