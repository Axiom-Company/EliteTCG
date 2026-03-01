import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Map DB columns to frontend-expected shape
const formatSet = (s) => ({ ...s, image: s.logo_url || null });

// GET all sets
router.get('/', async (req, res) => {
  try {
    const { active, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('sets')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .limit(parseInt(limit));

    if (active !== 'all') query = query.eq('is_active', true);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ sets: (data || []).map(formatSet), total: count || 0 });
  } catch (error) {
    console.error('Get sets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single set by id or code
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let { data } = await supabaseAdmin.from('sets').select('*').eq('id', id).maybeSingle();
    if (!data) {
      ({ data } = await supabaseAdmin.from('sets').select('*').eq('code', id).maybeSingle());
    }

    if (!data) return res.status(404).json({ error: 'Set not found' });
    res.json({ set: formatSet(data) });
  } catch (error) {
    console.error('Get set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create set
router.post('/', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const setData = req.body;

    const { count } = await supabaseAdmin
      .from('sets')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabaseAdmin
      .from('sets')
      .insert({
        name: setData.name,
        code: setData.code || '',
        release_date: setData.release_date || null,
        is_active: setData.is_active !== false,
        is_new: setData.is_new || false,
        display_order: (count || 0) + 1,
        logo_url: setData.image || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ set: formatSet(data) });
  } catch (error) {
    console.error('Create set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update set
router.put('/:id', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { image, ...rest } = updates;
    const dbUpdates = { ...rest, updated_at: new Date().toISOString() };
    if (image !== undefined) dbUpdates.logo_url = image;
    if (dbUpdates.release_date === '') dbUpdates.release_date = null;

    const { data, error } = await supabaseAdmin
      .from('sets')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ set: formatSet(data) });
  } catch (error) {
    console.error('Update set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE set
router.delete('/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('sets').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Set deleted' });
  } catch (error) {
    console.error('Delete set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST reorder sets
router.post('/reorder', authenticateToken, requireRole('super_admin', 'admin', 'manager'), async (req, res) => {
  try {
    const { orders } = req.body;
    await Promise.all(
      orders.map(({ id, display_order }) =>
        supabaseAdmin.from('sets').update({ display_order }).eq('id', id)
      )
    );
    res.json({ message: 'Sets reordered' });
  } catch (error) {
    console.error('Reorder sets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
