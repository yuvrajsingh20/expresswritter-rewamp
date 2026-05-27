/**
 * Uploads a file to a specific folder in the 'uploads' bucket on Supabase Storage via our secure API.
 * @param {File} file - The file object to upload
 * @param {string} folder - The folder prefix (e.g., 'portfolios', 'kyc', 'deliverables')
 * @returns {Promise<{ url: string | null, error: string | null }>}
 */
export async function uploadFileToSupabase(file, folder = 'general') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Server upload error:', data);
      return { url: null, error: data.message || 'Upload failed' };
    }

    return { url: data.url, error: null };
  } catch (err) {
    console.error('Upload utility error:', err);
    return { url: null, error: err.message };
  }
}
