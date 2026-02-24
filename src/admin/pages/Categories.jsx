import { useState, useEffect } from 'react';
import { categoriesApi, uploadApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Package,
  Box,
  CreditCard,
  Gift,
  BookOpen,
  Layers,
  MoreVertical,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const API_BASE = 'http://localhost:3001';

const iconMap = {
  box: Box,
  package: Package,
  card: CreditCard,
  gift: Gift,
  binder: BookOpen,
  sleeve: Layers,
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'box',
    is_active: true,
    image: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { categories: data } = await categoriesApi.getAll({ active: 'all' });
      setCategories(data || []);
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: 'box', is_active: true, image: null });
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
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
      let imageUrl = formData.image;
      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadApi.uploadImage(imageFile);
        imageUrl = uploadResult.url;
        setUploading(false);
      }
      const categoryData = { ...formData, image: imageUrl };
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData);
        setMessage({ type: 'success', text: 'Category updated' });
      } else {
        await categoriesApi.create(categoryData);
        setMessage({ type: 'success', text: 'Category created' });
      }
      resetForm();
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save category' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || 'box',
      is_active: category.is_active ?? true,
      image: category.image || null,
    });
    if (category.image) {
      setImagePreview(category.image.startsWith('http') ? category.image : `${API_BASE}${category.image}`);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      setMessage({ type: 'success', text: 'Category deleted' });
      fetchCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete category' });
    }
  };

  const getImageUrl = (category) => {
    if (!category.image) return null;
    return category.image.startsWith('http') ? category.image : `${API_BASE}${category.image}`;
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Categories</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Category
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-5 border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
          {message.text}
        </div>
      )}

      {/* Category Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Category Image (Optional)</Label>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#4a4a4a]" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="category-image-upload" />
                  <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                    <label htmlFor="category-image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4" strokeWidth={1.5} />
                      Choose Image
                    </label>
                  </Button>
                  <p className="text-xs text-[#4a4a4a]">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Booster Boxes" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. booster_box" />
              <p className="text-xs text-[#4a4a4a]">Used to link products to this category</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (uploading ? 'Uploading...' : 'Saving...') : (editingCategory ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6b6b] text-sm">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="border border-[#282828] rounded-xl p-16 text-center text-[#6b6b6b] text-sm">
          No categories yet. Add your first category to get started.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-3 md:grid-cols-2">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Box;
            const imgUrl = getImageUrl(category);
            return (
              <div key={category.id} className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden hover:border-[#333] transition-colors group">
                {/* Image / Icon area */}
                <div className="aspect-video isolate flex items-center justify-center p-5 border-b border-[#1e1e1e]" style={{ backgroundColor: '#ffffff' }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={category.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  ) : (
                    <IconComponent className="w-10 h-10 text-[#aaa]" strokeWidth={1} />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-[#f1f1f1] truncate leading-snug">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-[#6b6b6b] mt-0.5 line-clamp-1">{category.description}</p>
                      )}
                      <p className="text-xs text-[#4a4a4a] mt-1">{category.slug}</p>
                    </div>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6b6b6b] hover:text-[#f1f1f1] cursor-pointer shrink-0 -mr-1 -mt-1">
                          <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleEdit(category)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-600 hover:bg-red-50">Delete</DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  {!category.is_active && (
                    <div className="mt-3">
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#282828] text-[#6b6b6b] border border-[#333]">Inactive</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
