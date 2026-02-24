import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Local storage file path
const dataFilePath = path.join(__dirname, '..', 'data', 'categories.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load categories from local file
const loadLocalCategories = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  return [];
};

// Save categories to local file
const saveLocalCategories = (categories) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

// Initialize with default categories if empty
const initializeCategories = () => {
  let categories = loadLocalCategories();
  if (categories.length === 0) {
    categories = [
      { id: '1', name: 'Booster Boxes', slug: 'booster_box', description: 'Factory sealed booster boxes', icon: 'box', is_active: true, display_order: 1, image: null, created_at: new Date().toISOString() },
      { id: '2', name: 'Elite Trainer Boxes', slug: 'etb', description: 'ETBs with exclusive promos', icon: 'package', is_active: true, display_order: 2, image: null, created_at: new Date().toISOString() },
      { id: '3', name: 'Singles', slug: 'singles', description: 'Individual cards & holos', icon: 'card', is_active: true, display_order: 3, image: null, created_at: new Date().toISOString() },
      { id: '4', name: 'Special Collections', slug: 'collection', description: 'Premium boxes & tins', icon: 'gift', is_active: true, display_order: 4, image: null, created_at: new Date().toISOString() },
      { id: '5', name: 'Binders & Storage', slug: 'binders', description: 'Protect your collection', icon: 'binder', is_active: true, display_order: 5, image: null, created_at: new Date().toISOString() },
      { id: '6', name: 'Sleeves & Supplies', slug: 'accessories', description: 'Card sleeves & accessories', icon: 'sleeve', is_active: true, display_order: 6, image: null, created_at: new Date().toISOString() },
    ];
    saveLocalCategories(categories);
  }
  return categories;
};

// Initialize on first load
initializeCategories();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const { active, limit = 50 } = req.query;

    let categories = loadLocalCategories();
    if (active !== 'all') categories = categories.filter(c => c.is_active);
    categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    res.json({ categories: categories.slice(0, parseInt(limit)), total: categories.length });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categories = loadLocalCategories();
    const category = categories.find(c => c.id === id || c.slug === id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const categoryData = req.body;
    const categories = loadLocalCategories();

    // Create slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
    }

    const newCategory = {
      id: Date.now().toString(),
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      icon: categoryData.icon || 'box',
      is_active: categoryData.is_active !== false,
      display_order: categories.length + 1,
      image: categoryData.image || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    categories.push(newCategory);
    saveLocalCategories(categories);

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const categories = loadLocalCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categories[index] = {
      ...categories[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    saveLocalCategories(categories);
    res.json({ category: categories[index] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const categories = loadLocalCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categories.splice(index, 1);
    saveLocalCategories(categories);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder categories (admin only)
router.post('/reorder', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, display_order }

    const categories = loadLocalCategories();
    for (const item of orders) {
      const category = categories.find(c => c.id === item.id);
      if (category) {
        category.display_order = item.display_order;
      }
    }
    saveLocalCategories(categories);
    res.json({ message: 'Categories reordered' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
