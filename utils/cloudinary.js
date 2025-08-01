import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'events',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  }
});

// ✅ Add this function to handle direct uploads
const uploadToCloudinary = async (filePath, folder = 'profiles') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder
    });
    return result;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
};

// ✅ Export everything you need
export { cloudinary, storage, uploadToCloudinary };
