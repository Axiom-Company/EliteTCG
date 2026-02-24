import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Local storage file path
const dataFilePath = path.join(__dirname, '..', 'data', 'products.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load products from local file
const loadLocalProducts = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
  return [];
};

// Save products to local file
const saveLocalProducts = (products) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

// Initialize with some mock data if empty
const initializeProducts = () => {
  let products = loadLocalProducts();
  if (products.length === 0) {
    products = [
      { id: '1', name: 'Prismatic Evolutions Booster Box', slug: 'prismatic-evolutions-booster-box', description: 'A premium booster box featuring prismatic Pokemon cards.', price: 149.99, compare_at_price: 179.99, category: 'booster_box', badge: 'hot', is_active: true, is_featured: true, rating: 4.9, review_count: 128, images: [], inventory: { quantity: 25, low_stock_threshold: 5 }, created_at: new Date().toISOString() },
      { id: '2', name: 'Surging Sparks Elite Trainer Box', slug: 'surging-sparks-etb', description: 'Elite Trainer Box with exclusive cards and accessories.', price: 49.99, compare_at_price: null, category: 'etb', badge: 'new', is_active: true, is_featured: true, rating: 4.8, review_count: 64, images: [], inventory: { quantity: 42, low_stock_threshold: 5 }, created_at: new Date().toISOString() },
      { id: '3', name: 'Charizard ex SAR #234', slug: 'charizard-ex-sar-234', description: 'Rare Special Art Rare Charizard card.', price: 289.99, compare_at_price: null, category: 'singles', badge: 'none', is_active: true, is_featured: true, rating: 5.0, review_count: 42, images: [], inventory: { quantity: 3, low_stock_threshold: 5 }, created_at: new Date().toISOString() },
    ];
    saveLocalProducts(products);
  }
  return products;
};

// Initialize on first load
initializeProducts();

// Get all products (public) - Always use local storage for full feature support
router.get('/', async (req, res) => {
  try {
    const { category, set_id, featured, active, badge, limit = 50, offset = 0 } = req.query;

    const localProducts = loadLocalProducts();
    let filtered = [...localProducts];
    if (category) filtered = filtered.filter(p => p.category === category);
    if (set_id) filtered = filtered.filter(p => p.set_id === set_id);
    if (featured === 'true') filtered = filtered.filter(p => p.is_featured);
    if (active !== 'all') filtered = filtered.filter(p => p.is_active);
    if (badge) filtered = filtered.filter(p => p.badge === badge);

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ products: filtered.slice(0, parseInt(limit)), total: filtered.length });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product - Always use local storage
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const localProducts = loadLocalProducts();
    const product = localProducts.find(p => p.id === id || p.slug === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (admin only) - Always use local storage
router.post('/', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const productData = req.body;

    // Create slug if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const localProducts = loadLocalProducts();
    const newProduct = {
      id: Date.now().toString(),
      name: productData.name,
      slug: productData.slug,
      description: productData.description || '',
      price: parseFloat(productData.price) || 0,
      compare_at_price: productData.compare_at_price ? parseFloat(productData.compare_at_price) : null,
      currency: productData.currency || 'ZAR',
      category: productData.category || 'booster_box',
      badge: productData.badge || 'none',
      set_id: productData.set_id || null,
      is_active: productData.is_active !== false,
      is_featured: productData.is_featured || false,
      rating: 0,
      review_count: 0,
      images: productData.images || [],
      sku: productData.sku || '',
      inventory: {
        quantity: parseInt(productData.initial_quantity) || 0,
        low_stock_threshold: parseInt(productData.low_stock_threshold) || 5
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localProducts.push(newProduct);
    saveLocalProducts(localProducts);

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (admin only) - Always use local storage
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const localProducts = loadLocalProducts();
    const index = localProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product
    localProducts[index] = {
      ...localProducts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    saveLocalProducts(localProducts);
    res.json({ product: localProducts[index] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (admin only) - Always use local storage
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const localProducts = loadLocalProducts();
    const index = localProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    localProducts.splice(index, 1);
    saveLocalProducts(localProducts);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update inventory - Always use local storage
router.patch('/:id/inventory', authenticateToken, requireRole('super_admin', 'admin', 'manager', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, adjustment, low_stock_threshold } = req.body;

    const localProducts = loadLocalProducts();
    const product = localProducts.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.inventory) {
      product.inventory = { quantity: 0, low_stock_threshold: 5 };
    }

    if (quantity !== undefined) {
      product.inventory.quantity = quantity;
    } else if (adjustment !== undefined) {
      product.inventory.quantity = (product.inventory.quantity || 0) + adjustment;
    }

    if (low_stock_threshold !== undefined) {
      product.inventory.low_stock_threshold = low_stock_threshold;
    }

    saveLocalProducts(localProducts);
    res.json({ inventory: product.inventory });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
