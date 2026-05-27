import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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

    // 2. Max File Size Check (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File size exceeds limit of 5MB' }, { status: 400 });
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

    // 4. Upload to Supabase Storage using Service Role (Admin) key to bypass RLS
    // If the service role key is not defined, we fallback to the public key.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    
    const folder = formData.get('folder') || 'general';
    const uniquePath = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(uniquePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      name: file.name
    }, { status: 200 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
        message: 'Upload failed', 
        error: error.message 
    }, { status: 500 });
  }
}
