/**
 * Image uploads via Cloudinary.
 * Text / poll posts do NOT need this — only the Image post type does.
 * If Cloudinary env vars or packages are missing, the route returns 503.
 */

let upload = null;
let configured = false;
let loadError = null;

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

try {
  if (isCloudinaryConfigured()) {
    const multer = require('multer');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const cloudinary = require('../config/cloudinary');

    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'diabuddy_community',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, crop: 'limit' }],
      },
    });

    upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });
    configured = true;
  }
} catch (err) {
  loadError = err.message;
  console.warn('Image upload unavailable:', err.message);
}

function requireUpload(req, res, next) {
  if (!configured || !upload) {
    return res.status(503).json({
      message:
        'Image uploads are not configured. Text and poll posts still work. To enable images, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, and install cloudinary/multer packages.',
      configured: false,
      error: loadError || undefined,
    });
  }
  return upload.array('images', 4)(req, res, next);
}

module.exports = { requireUpload, isCloudinaryConfigured: () => configured };
