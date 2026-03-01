import { supabaseAdmin } from '../config/supabase.js';

// Verify Supabase JWT token (for admin users)
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Look up admin role from admin_users table
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check if user has required role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Verify Supabase JWT token for customers
export const authenticateCustomer = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Look up customer profile
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .select('id, email, name, first_name, last_name, is_seller')
      .eq('id', user.id)
      .single();

    if (custError || !customer) {
      return res.status(403).json({ error: 'Customer profile not found' });
    }

    // Get seller_id if customer is a seller
    let sellerId = null;
    if (customer.is_seller) {
      const { data: sellerProfile } = await supabaseAdmin
        .from('seller_profiles')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('is_active', true)
        .single();
      sellerId = sellerProfile?.id || null;
    }

    req.customer = {
      id: customer.id,
      email: customer.email,
      name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      is_seller: customer.is_seller || false,
      seller_id: sellerId,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional customer authentication (sets req.customer if valid token, continues regardless)
export const optionalCustomerAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('id, email, name, first_name, last_name, is_seller')
          .eq('auth_user_id', user.id)
          .single();

        if (customer) {
          let sellerId = null;
          if (customer.is_seller) {
            const { data: sellerProfile } = await supabaseAdmin
              .from('seller_profiles')
              .select('id')
              .eq('customer_id', customer.id)
              .eq('is_active', true)
              .single();
            sellerId = sellerProfile?.id || null;
          }

          req.customer = {
            id: customer.id,
            email: customer.email,
            name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
            is_seller: customer.is_seller || false,
            seller_id: sellerId,
            auth_user_id: user.id,
          };
        }
      }
    } catch (error) {
      // Token invalid, but continue anyway (it's optional)
    }
  }

  next();
};

// Require user to be a verified seller
export const requireSeller = (req, res, next) => {
  if (!req.customer) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.customer.is_seller) {
    return res.status(403).json({ error: 'Seller account required' });
  }

  if (!req.customer.seller_id) {
    return res.status(403).json({ error: 'Seller profile not found' });
  }

  next();
};

export default {
  authenticateToken,
  requireRole,
  authenticateCustomer,
  optionalCustomerAuth,
  requireSeller,
};
