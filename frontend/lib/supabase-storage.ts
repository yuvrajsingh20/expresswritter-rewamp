import { createClient } from '@/utils/supabase/client';

/**
 * Uploads a file (image or PDF) to a specified Supabase Storage bucket.
 * @param file - The File object to upload
 * @param bucket - The name of the bucket (e.g., 'uploads')
 * @param path - The path inside the bucket (optional, defaults to timestamp + filename)
 * @returns An object containing { url, error }
 */
export async function uploadToSupabase(file: File, bucket: string = 'uploads', path?: string) {
  const supabase = createClient();
  
  // Create a unique path if not provided
  const filePath = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Unexpected upload error:', err);
    return { url: null, error: err.message || 'An unexpected error occurred' };
  }
}
