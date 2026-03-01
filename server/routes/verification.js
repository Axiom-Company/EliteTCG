import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateCustomer, requireSeller, authenticateToken, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for verification documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `verification-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /submit - Submit verification documents (seller only)
router.post('/submit', authenticateCustomer, requireSeller, upload.fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    const idDocumentFile = req.files?.id_document?.[0];
    const selfieFile = req.files?.selfie?.[0];

    if (!idDocumentFile) {
      return res.status(400).json({ error: 'ID document is required' });
    }

    if (!selfieFile) {
      // Clean up the id_document that was already uploaded
      if (idDocumentFile) {
        const filePath = path.join(uploadsDir, idDocumentFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({ error: 'Selfie is required' });
    }

    const idDocumentUrl = `/uploads/${idDocumentFile.filename}`;
    const selfieUrl = `/uploads/${selfieFile.filename}`;

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('seller_profiles')
        .update({
          id_document_url: idDocumentUrl,
          selfie_url: selfieUrl,
          verification_status: 'pending'
        })
        .eq('id', req.customer.seller_id);

      if (error) {
        console.error('Verification submit error:', error);
        return res.status(500).json({ error: 'Failed to submit verification documents' });
      }
    }

    res.json({
      message: 'Verification documents submitted',
      status: 'pending'
    });
  } catch (error) {
    console.error('Verification submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /status - Get own verification status (seller only)
router.get('/status', authenticateCustomer, requireSeller, async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('seller_profiles')
        .select('verification_status, is_verified, updated_at')
        .eq('id', req.customer.seller_id)
        .single();

      if (error || !data) {
        console.error('Verification status error:', error);
        return res.status(404).json({ error: 'Seller profile not found' });
      }

      const response = {
        status: data.verification_status,
        is_verified: data.is_verified
      };

      if (data.verification_status !== 'none') {
        response.submitted_at = data.updated_at;
      }

      return res.json(response);
    }

    // Mock fallback
    res.json({
      status: 'none',
      is_verified: false
    });
  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:sellerId/approve - Admin approve verification
router.post('/:sellerId/approve', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!UUID_REGEX.test(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID format' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('seller_profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_status: 'approved'
        })
        .eq('id', sellerId)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Verification approve error:', error);
        return res.status(404).json({ error: 'Seller not found' });
      }
    }

    res.json({ message: 'Seller verified successfully' });
  } catch (error) {
    console.error('Verification approve error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:sellerId/reject - Admin reject verification
router.post('/:sellerId/reject', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!UUID_REGEX.test(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID format' });
    }

    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('seller_profiles')
        .update({
          verification_status: 'rejected',
          is_verified: false
        })
        .eq('id', sellerId)
        .select('id')
        .single();

      if (error || !data) {
        console.error('Verification reject error:', error);
        return res.status(404).json({ error: 'Seller not found' });
      }
    }

    res.json({ message: 'Verification rejected' });
  } catch (error) {
    console.error('Verification reject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

export default router;
