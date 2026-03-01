import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Get current admin user (verifies token + admin role via middleware)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('id', req.user.id)
      .single();

    if (error || !adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Update last_login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    res.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
