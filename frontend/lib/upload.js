import { supabase } from './supabaseClient'

/**
 * Uploads a file to a specific folder in the 'expresswriters' bucket on Supabase Storage.
 * @param {File} file - The file object to upload
 * @param {string} folder - The folder prefix (e.g., 'portfolios', 'kyc', 'deliverables')
 * @returns {Promise<{ url: string | null, error: string | null }>}
 */
export async function uploadFileToSupabase(file, folder = 'general') {
  try {
    // Generate a unique filename using timestamp and a random string to avoid collisions
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}_${randomString}_${sanitizedName}`;

    // Upload to 'expresswriters' bucket
    const { data, error } = await supabase.storage
      .from('expresswriters')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { url: null, error: error.message };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('expresswriters')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (err) {
    console.error('Upload utility error:', err);
    return { url: null, error: err.message };
  }
}
