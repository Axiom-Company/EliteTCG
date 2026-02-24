import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Local storage file path
const dataFilePath = path.join(__dirname, '..', 'data', 'sets.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load sets from local file
const loadLocalSets = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading sets:', error);
  }
  return [];
};

// Save sets to local file
const saveLocalSets = (sets) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(sets, null, 2));
  } catch (error) {
    console.error('Error saving sets:', error);
  }
};

// Initialize with some sample data if empty
let localSets = loadLocalSets();
if (localSets.length === 0) {
  localSets = [
    { id: '1', name: 'Prismatic Evolutions', code: 'PRE', release_date: '2025-01-17', is_active: true, is_new: true, display_order: 1, image: null, created_at: new Date().toISOString() },
    { id: '2', name: 'Surging Sparks', code: 'SSP', release_date: '2024-11-08', is_active: true, is_new: true, display_order: 2, image: null, created_at: new Date().toISOString() },
    { id: '3', name: 'Stellar Crown', code: 'SCR', release_date: '2024-09-13', is_active: true, is_new: false, display_order: 3, image: null, created_at: new Date().toISOString() },
  ];
  saveLocalSets(localSets);
}

// Get all sets (public) - Always use local storage for full feature support
router.get('/', async (req, res) => {
  try {
    const { active, limit = 50 } = req.query;

    let filtered = [...localSets];
    if (active !== 'all') filtered = filtered.filter(s => s.is_active);
    filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    res.json({ sets: filtered.slice(0, parseInt(limit)), total: filtered.length });
  } catch (error) {
    console.error('Get sets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single set - Always use local storage
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const set = localSets.find(s => s.id === id || s.code === id);
    if (!set) return res.status(404).json({ error: 'Set not found' });
    res.json({ set });
  } catch (error) {
    console.error('Get set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create set (admin only) - Always use local storage for full feature support
router.post('/', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const setData = req.body;

    // Always use local storage to support image field
    const newSet = {
      id: Date.now().toString(),
      name: setData.name,
      code: setData.code || '',
      release_date: setData.release_date || null,
      is_active: setData.is_active !== false,
      is_new: setData.is_new || false,
      display_order: localSets.length + 1,
      image: setData.image || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localSets.push(newSet);
    saveLocalSets(localSets);

    res.status(201).json({ set: newSet });
  } catch (error) {
    console.error('Create set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update set (admin only) - Always use local storage
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const index = localSets.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Set not found' });
    }

    localSets[index] = {
      ...localSets[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    saveLocalSets(localSets);
    res.json({ set: localSets[index] });
  } catch (error) {
    console.error('Update set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete set (admin only) - Always use local storage
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const index = localSets.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Set not found' });
    }

    localSets.splice(index, 1);
    saveLocalSets(localSets);
    res.json({ message: 'Set deleted' });
  } catch (error) {
    console.error('Delete set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder sets (admin only) - Always use local storage
router.post('/reorder', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, display_order }

    for (const item of orders) {
      const set = localSets.find(s => s.id === item.id);
      if (set) {
        set.display_order = item.display_order;
      }
    }
    saveLocalSets(localSets);
    res.json({ message: 'Sets reordered' });
  } catch (error) {
    console.error('Reorder sets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
