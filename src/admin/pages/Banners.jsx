import { useState, useEffect } from 'react';
import { bannersApi, uploadApi } from '../hooks/useApi';
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
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react';

const API_BASE = 'http://localhost:3001'; // Ensure this matches your backend API base URL

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    image_url: '',
    alt_text: '',
    link_url: '',
    display_order: '0',
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      const data = await bannersApi.getAll();
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to fetch banners' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setFormData({
      image_url: '',
      alt_text: '',
      link_url: '',
      display_order: '0',
      is_active: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingBanner(null);
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

    const dataToSubmit = new FormData();
    dataToSubmit.append('alt_text', formData.alt_text);
    dataToSubmit.append('link_url', formData.link_url);
    dataToSubmit.append('display_order', formData.display_order);
    dataToSubmit.append('is_active', formData.is_active);

    if (imageFile) {
      dataToSubmit.append('image', imageFile);
    } else if (editingBanner && formData.image_url) {
      // If editing and no new file, but an existing image, we might need to handle it differently
      // For now, we'll assume image_url is already handled if no new file is selected.
    } else {
        setMessage({ type: 'error', text: 'Please upload an image for the banner.' });
        setSaving(false);
        return;
    }

    try {
      if (editingBanner) {
        // Update existing banner
        // Note: For image updates on existing banners, the current API only supports re-uploading
        // We might need a separate endpoint or logic for updating non-image fields.
        // For simplicity, if a new image is selected, it's treated as a full replacement.
        // If no new image, but editing other fields, we need to adapt this.
        // For now, only new images can be "updated" via this path.
        if (imageFile) {
            await bannersApi.update(editingBanner.id, dataToSubmit);
        } else {
            // If no new image, but other fields are changed, send a different payload or call a different endpoint
            // This is a simplification. A real-world scenario might have a PATCH endpoint for metadata.
            // For now, if no new image, we assume only metadata can be changed.
            await bannersApi.updateMetadata(editingBanner.id, {
                alt_text: formData.alt_text,
                link_url: formData.link_url,
                display_order: parseInt(formData.display_order),
                is_active: formData.is_active,
            });
        }
        setMessage({ type: 'success', text: 'Banner updated successfully!' });
      } else {
        // Create new banner
        await bannersApi.create(dataToSubmit);
        setMessage({ type: 'success', text: 'Banner created successfully!' });
      }
      resetForm();
      setShowForm(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save banner' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };


  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url || '',
      alt_text: banner.alt_text || '',
      link_url: banner.link_url || '',
      display_order: banner.display_order?.toString() || '0',
      is_active: banner.is_active ?? true,
    });
    setImagePreview(banner.image_url ? (banner.image_url.startsWith('http') ? banner.image_url : `${API_BASE}${banner.image_url}`) : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannersApi.remove(id);
      setMessage({ type: 'success', text: 'Banner deleted successfully!' });
      fetchBanners();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete banner' });
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Banners</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">{banners.length} banners</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Banner
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-5 border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
          {message.text}
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6b6b] text-sm">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="border border-[#282828] rounded-xl p-16 text-center text-[#6b6b6b] text-sm">
          No banners found. Add a new banner to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden group">
              <div className="relative aspect-video bg-[#1c1c1c] flex items-center justify-center">
                {banner.image_url ? (
                  <img
                    src={banner.image_url.startsWith('http') ? banner.image_url : `${API_BASE}${banner.image_url}`}
                    alt={banner.alt_text || 'Banner Image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#4a4a4a]" strokeWidth={1} />
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6b6b6b] hover:text-[#f1f1f1] cursor-pointer shrink-0">
                        <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Button>
                    }
                  >
                    <DropdownMenuItem onClick={() => handleEdit(banner)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(banner.id)} className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[15px] font-medium text-[#f1f1f1] leading-snug">{banner.alt_text || 'No Alt Text'}</p>
                <p className="text-sm text-[#a0a0a0] mt-1 truncate">{banner.link_url || 'No Link'}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 text-[10px] rounded-full border bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]">
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#282828] text-[#a0a0a0] border border-[#333]">
                    Order: {banner.display_order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="flex items-start gap-3">
                <div className="w-24 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#4a4a4a]" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="banner-image-upload" />
                  <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                    <label htmlFor="banner-image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4" strokeWidth={1.5} />
                      Choose Image
                    </label>
                  </Button>
                  <p className="text-xs text-[#4a4a4a]">Recommended: 1920x640px. Max 5MB.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input id="alt_text" value={formData.alt_text} onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })} placeholder="Descriptive text for the banner" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL (Optional)</Label>
              <Input id="link_url" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} placeholder="e.g., /shop or https://example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (uploading ? 'Uploading...' : 'Saving...') : (editingBanner ? 'Update Banner' : 'Add Banner')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Banners;
