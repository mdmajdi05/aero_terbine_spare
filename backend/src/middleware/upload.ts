import multer from 'multer';

// Store file in memory — Cloudinary receives the buffer directly.
// No disk writes on the server.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const blogUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
  },
});
