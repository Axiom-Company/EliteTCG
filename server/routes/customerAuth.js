import { Router } from 'express';
import { z } from 'zod';
import { authenticateCustomer } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().optional(),
  accepts_marketing: z.boolean().optional().default(false)
});

const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  accepts_marketing: z.boolean().optional()
});

// Helper to get seller profile
const getSellerProfile = async (customerId) => {
  if (!supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from('seller_profiles')
    .select('id')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .single();

  return data;
};

// Register new customer (creates Supabase Auth user + customer profile)
router.post('/register', async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Auth service not configured' });
    }

    const { email, password, first_name, last_name, phone, accepts_marketing } = validation.data;

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: false, // Supabase will send confirmation email
      user_metadata: { first_name, last_name }
    });

    if (authError) {
      if (authError.message?.includes('already been registered')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('Supabase auth create error:', authError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Create customer profile row with id = Supabase Auth user id
    const { data: customer, error: profileError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        first_name,
        last_name,
        name: `${first_name} ${last_name}`,
        phone,
        accepts_marketing,
        is_active: true,
        is_seller: false
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('Customer profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        name: customer.name,
        is_seller: customer.is_seller
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current customer profile
router.get('/me', authenticateCustomer, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', req.customer.id)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get seller profile if customer is a seller
    let sellerProfile = null;
    if (customer.is_seller) {
      const { data } = await supabaseAdmin
        .from('seller_profiles')
        .select('*')
        .eq('customer_id', customer.id)
        .single();

      sellerProfile = data;
    }

    res.json({
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        phone: customer.phone,
        address_line1: customer.address_line1,
        address_line2: customer.address_line2,
        city: customer.city,
        state: customer.state,
        postal_code: customer.postal_code,
        country: customer.country,
        accepts_marketing: customer.accepts_marketing,
        is_seller: customer.is_seller,
        seller_profile: sellerProfile ? {
          id: sellerProfile.id,
          display_name: sellerProfile.display_name,
          rating: sellerProfile.rating,
          total_sales: sellerProfile.total_sales
        } : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer profile
router.put('/me', authenticateCustomer, async (req, res) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const updates = validation.data;

    // Update name field if first_name or last_name changed
    if (updates.first_name || updates.last_name) {
      const { data: current } = await supabaseAdmin
        .from('customers')
        .select('first_name, last_name')
        .eq('id', req.customer.id)
        .single();

      const firstName = updates.first_name || current?.first_name || '';
      const lastName = updates.last_name || current?.last_name || '';
      updates.name = `${firstName} ${lastName}`.trim();
    }

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .update(updates)
      .eq('id', req.customer.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        name: customer.name,
        phone: customer.phone,
        address_line1: customer.address_line1,
        address_line2: customer.address_line2,
        city: customer.city,
        state: customer.state,
        postal_code: customer.postal_code,
        is_seller: customer.is_seller
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
