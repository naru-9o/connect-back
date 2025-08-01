import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

console.log('=== MULTER SETUP ===');
console.log('Storage imported:', !!storage);

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/x-png', 'image/webp'];

    console.log('📦 MIME type:', file.mimetype);

    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log('✅ MULTER: File type allowed');
      cb(null, true);
    } else {
      console.log('❌ MULTER: File type not allowed');
      cb(new Error('Only JPEG, JPG, and PNG files are allowed'), false);
    }
  }
});

export default upload;

