import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileUri, fileName) => {
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      public_id: fileName,
      resource_type: 'auto',
    });
    return {
      url: res.secure_url,
      name: fileName,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export default cloudinary;
