import { useState, useEffect } from 'react';
import { setsApi, uploadApi } from '../hooks/useApi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Upload,
  Grid3X3,
  MoreVertical,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ELITE_API_URL } from '@/config/api';

const API_BASE = ELITE_API_URL;

const Sets = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    release_date: '',
    is_active: true,
    is_new: false,
    image: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchSets = async () => {
    try {
      const { sets: data } = await setsApi.getAll({ active: 'all' });
      setSets(data || []);
    } catch (error) {
      console.error('Fetch sets error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSets(); }, []);

  const filteredSets = sets.filter(set =>
    set.name.toLowerCase().includes(search.toLowerCase()) ||
    set.code?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', code: '', release_date: '', is_active: true, is_new: false, image: null });
    setImageFile(null);
    setImagePreview(null);
    setEditingSet(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let imageUrl = formData.image || null;
      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadApi.uploadImage(imageFile);
        imageUrl = uploadResult.url;
        setUploading(false);
      }
      const setData = { ...formData, image: imageUrl };
      if (editingSet) {
        await setsApi.update(editingSet.id, setData);
        setMessage({ type: 'success', text: 'Set updated' });
      } else {
        await setsApi.create(setData);
        setMessage({ type: 'success', text: 'Set created' });
      }
      resetForm();
      setShowForm(false);
      fetchSets();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save set' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (set) => {
    setEditingSet(set);
    setFormData({
      name: set.name || '',
      code: set.code || '',
      release_date: set.release_date || '',
      is_active: set.is_active ?? true,
      is_new: set.is_new ?? false,
      image: set.image || null,
    });
    if (set.image) {
      setImagePreview(set.image.startsWith('http') ? set.image : `${API_BASE}${set.image}`);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this set?')) return;
    try {
      await setsApi.delete(id);
      setMessage({ type: 'success', text: 'Set deleted' });
      fetchSets();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete set' });
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Sets</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">{sets.length} Pokémon sets</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Set
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-5 border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search sets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-[220px] bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors"
          />
        </div>
      </div>

      {/* Set Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              {editingSet ? 'Edit Set' : 'New Set'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Set Image / Logo</Label>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <Grid3X3 className="w-6 h-6 text-[#4a4a4a]" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="set-image-upload" />
                  <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                    <label htmlFor="set-image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4" strokeWidth={1.5} />
                      Choose Image
                    </label>
                  </Button>
                  <p className="text-xs text-[#4a4a4a]">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Set Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Perfect Order" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Set Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. POR" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input id="release_date" type="date" value={formData.release_date} onChange={(e) => setFormData({ ...formData, release_date: e.target.value })} />
            </div>
            <div className="flex items-center gap-8 pt-1">
              <div className="flex items-center gap-2">
                <Switch id="active" checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label htmlFor="active" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is_new" checked={formData.is_new} onCheckedChange={(v) => setFormData({ ...formData, is_new: v })} />
                <Label htmlFor="is_new" className="cursor-pointer">New Release</Label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (uploading ? 'Uploading...' : 'Saving...') : (editingSet ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6b6b] text-sm">Loading...</div>
      ) : filteredSets.length === 0 ? (
        <div className="border border-[#282828] rounded-xl p-16 text-center text-[#6b6b6b] text-sm">
          No sets found
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-3 md:grid-cols-2">
          {filteredSets.map((set) => (
            <div key={set.id} className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden hover:border-[#333] transition-colors group">
              {/* Image */}
              <div className="aspect-video isolate flex items-center justify-center p-5 border-b border-[#1e1e1e]" style={{ backgroundColor: '#ffffff' }}>
                {set.image ? (
                  <img
                    src={set.image.startsWith('http') ? set.image : `${API_BASE}${set.image}`}
                    alt={set.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <Grid3X3 className="w-10 h-10 text-[#aaa]" strokeWidth={1} />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[#f1f1f1] truncate leading-snug">{set.name}</p>
                    {set.code && <p className="text-sm text-[#6b6b6b] mt-0.5">{set.code}</p>}
                    <p className="text-xs text-[#4a4a4a] mt-1">{set.release_date || '—'}</p>
                  </div>
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6b6b6b] hover:text-[#f1f1f1] cursor-pointer shrink-0 -mr-1 -mt-1">
                        <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Button>
                    }
                  >
                    <DropdownMenuItem onClick={() => handleEdit(set)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(set.id)} className="text-red-600 hover:bg-red-50">Delete</DropdownMenuItem>
                  </DropdownMenu>
                </div>

                {(set.is_new || !set.is_active) && (
                  <div className="flex gap-1.5 mt-3">
                    {set.is_new && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#1e1e1e] text-[#6b6b6b] border border-[#2e2e2e]">New</span>
                    )}
                    {!set.is_active && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#282828] text-[#6b6b6b] border border-[#333]">Draft</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sets;
