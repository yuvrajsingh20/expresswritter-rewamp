// File Migration Script
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const BUCKET_NAME = 'uploads'; // Ensure this bucket exists in Supabase

async function downloadFile(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    
    // Guess mime type from URL or fallback
    let contentType = 'application/octet-stream';
    if (url.match(/\.(jpeg|jpg)$/i)) contentType = 'image/jpeg';
    else if (url.match(/\.png$/i)) contentType = 'image/png';
    else if (url.match(/\.pdf$/i)) contentType = 'application/pdf';
    else if (response.headers['content-type']) contentType = response.headers['content-type'];
    
    return { buffer, contentType };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function uploadToSupabase(buffer, contentType, originalUrl) {
  const fileName = originalUrl.split('/').pop().split('?')[0];
  const uniquePath = `${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniquePath, buffer, {
      contentType: contentType,
      upsert: false
    });

  if (error) {
    console.error(`Failed to upload ${fileName} to Supabase:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}

async function migrateUserImages() {
  console.log('Migrating User profile images...');
  const users = await prisma.user.findMany({ where: { image: { contains: 'http' } } });
  let count = 0;
  
  for (const user of users) {
    if (user.image.includes('supabase.co') || user.image.includes('googleusercontent')) continue; // Skip if already migrated or it's a google auth pic
    
    console.log(`Processing image for user ${user.email}...`);
    const fileData = await downloadFile(user.image);
    if (!fileData) continue;
    
    const newUrl = await uploadToSupabase(fileData.buffer, fileData.contentType, user.image);
    if (newUrl) {
      await prisma.user.update({ where: { id: user.id }, data: { image: newUrl } });
      count++;
    }
  }
  console.log(`Migrated ${count} user images.\n`);
}

async function migrateFiles() {
  console.log('Starting file migration to Supabase Storage...');
  
  // Example for Users. You can add more loops here for Projects.attachments, etc.
  await migrateUserImages();
  
  console.log('File migration complete!');
  await prisma.$disconnect();
}

migrateFiles();
