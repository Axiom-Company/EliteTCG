import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireRole, authenticateCustomer, requireSeller } from '../middleware/auth.js';

const router = Router();

const BUCKET = 'images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const WEBP_QUALITY = 82;

// File filter - only allow images
const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Memory storage - buffer in RAM, no disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Generate a unique filename: {timestamp}-{random9digits}.webp
 */
function generateFilename() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
  return `${timestamp}-${random}.webp`;
}

/**
 * Convert an image buffer to WebP using sharp, then upload to Supabase Storage.
 * Returns the public URL on success, or throws on failure.
 */
async function convertAndUpload(buffer, folder) {
  if (!supabaseAdmin) {
    throw new Error('Supabase client is not configured');
  }

  const webpBuffer = await sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const filename = generateFilename();
  const filePath = `${folder}/${filename}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    filename,
    filePath,
    size: webpBuffer.length,
  };
}

// Upload single image (admin) — products/ path
router.post(
  '/image',
  authenticateToken,
  requireRole('super_admin', 'admin', 'manager'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const result = await convertAndUpload(req.file.buffer, 'products');

      res.json({
        success: true,
        url: result.url,
        filename: result.filename,
        originalName: req.file.originalname,
        size: result.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Upload single image (seller) — listings/ path
router.post(
  '/seller-image',
  authenticateCustomer,
  requireSeller,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const result = await convertAndUpload(req.file.buffer, 'listings');

      res.json({
        success: true,
        url: result.url,
        filename: result.filename,
        originalName: req.file.originalname,
        size: result.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Upload multiple images (admin) — products/ path
router.post(
  '/images',
  authenticateToken,
  requireRole('super_admin', 'admin', 'manager'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const results = await Promise.all(
        req.files.map(async (file) => {
          const result = await convertAndUpload(file.buffer, 'products');
          return {
            url: result.url,
            filename: result.filename,
            originalName: file.originalname,
            size: result.size,
          };
        })
      );

      res.json({
        success: true,
        images: results,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

// Delete image from Supabase Storage
// Requires query param: ?path=products/filename.webp
router.delete(
  '/:filename',
  authenticateToken,
  requireRole('super_admin', 'admin'),
  async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client is not configured' });
      }

      const bucketPath = req.query.path;

      if (!bucketPath || typeof bucketPath !== 'string') {
        return res.status(400).json({ error: 'Query parameter "path" is required (e.g. ?path=products/file.webp)' });
      }

      // Prevent path traversal
      if (bucketPath.includes('..') || bucketPath.startsWith('/')) {
        return res.status(400).json({ error: 'Invalid file path' });
      }

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove([bucketPath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ error: 'Failed to delete image' });
      }

      res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

// Error handling middleware for multer
router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

export default router;
