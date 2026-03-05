import { useState, useEffect } from 'react';
import { productsApi, uploadApi, setsApi, categoriesApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Upload,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Star,
  Package,
} from 'lucide-react';
import { ELITE_API_URL } from '@/config/api';

const API_BASE = ELITE_API_URL;


const SkeletonCard = () => (
  <div className="bg-[#111111] border border-[#282828] rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-[#1a1a1a]" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-[#1e1e1e] rounded w-1/3" />
      <div className="h-4 bg-[#1e1e1e] rounded w-4/5" />
      <div className="h-4 bg-[#1e1e1e] rounded w-2/5" />
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sets, setSets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    category: '',
    badge: 'none',
    sku: '',
    set_id: '',
    initial_quantity: '0',
    low_stock_threshold: '5',
    is_active: true,
    is_featured: false,
    images: [],
    dimensions: { weight: '', length: '', width: '', height: '' },
    box_contents: '',
  });
  const [sectionsOpen, setSectionsOpen] = useState({ dimensions: false, box: false });
  const toggleSection = (key) => setSectionsOpen(p => ({ ...p, [key]: !p[key] }));

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      const params = { active: 'all' };
      if (filter !== 'all') params.category = filter;
      const { products: data } = await productsApi.getAll(params);
      setProducts(data || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSets = async () => {
    try {
      const { sets: data } = await setsApi.getAll({ active: 'all' });
      setSets(data || []);
    } catch (error) {
      console.error('Fetch sets error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      const cats = data.categories || data || [];
      setCategories(cats.filter(c => c.is_active));
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSets();
    fetchCategories();
  }, [filter]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = products.filter(p => p.is_active).length;
  const draftCount = products.filter(p => !p.is_active).length;
  const lowStockCount = products.filter(p => (p.inventory?.quantity || 0) <= (p.inventory?.low_stock_threshold || 5)).length;

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', compare_at_price: '',
      category: '', badge: 'none', sku: '',
      set_id: '', initial_quantity: '0', low_stock_threshold: '5',
      is_active: true, is_featured: false, images: [],
      dimensions: { weight: '', length: '', width: '', height: '' },
      box_contents: '',
    });
    setSectionsOpen({ dimensions: false, box: false });
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setEditingProduct(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let allImageUrls = [...existingImages];
      if (newImageFiles.length) {
        setUploading(true);
        const newUrls = await uploadApi.uploadImages(newImageFiles);
        allImageUrls = [...allImageUrls, ...newUrls];
        setUploading(false);
      }
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        initial_quantity: parseInt(formData.initial_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        images: allImageUrls,
      };
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData);
        setMessage({ type: 'success', text: 'Product updated' });
      } else {
        await productsApi.create(productData);
        setMessage({ type: 'success', text: 'Product created' });
      }
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save product' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      compare_at_price: product.compare_at_price?.toString() || '',
      category: product.category || 'booster_box',
      badge: product.badge || 'none',
      sku: product.sku || '',
      set_id: product.set_id || '',
      initial_quantity: product.inventory?.quantity?.toString() || '0',
      low_stock_threshold: product.inventory?.low_stock_threshold?.toString() || '5',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      images: product.images || [],
      dimensions: product.dimensions || { weight: '', length: '', width: '', height: '' },
      box_contents: product.box_contents || '',
    });
    const hasDims = product.dimensions && Object.values(product.dimensions).some(v => v);
    setSectionsOpen({ dimensions: !!hasDims, box: !!product.box_contents });
    setExistingImages(product.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsApi.delete(id);
      setMessage({ type: 'success', text: 'Product deleted' });
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Products</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            {loading ? '—' : (
              <>
                {activeCount} active
                {draftCount > 0 && <> · {draftCount} draft</>}
                {lowStockCount > 0 && <> · {lowStockCount} low stock</>}
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Product
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-5 border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full sm:w-[220px] bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#1e1e1e] text-[#f1f1f1] border-[#3a3a3a]'
                : 'bg-transparent text-[#6b6b6b] border-[#282828] hover:border-[#333] hover:text-[#c4c4c4]'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.slug)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                filter === cat.slug
                  ? 'bg-[#1e1e1e] text-[#f1f1f1] border-[#3a3a3a]'
                  : 'bg-transparent text-[#6b6b6b] border-[#282828] hover:border-[#333] hover:text-[#c4c4c4]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-2">
                {/* Existing images */}
                {existingImages.map((url, i) => (
                  <div key={`e-${i}`} className="relative w-16 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    <img src={url.startsWith('http') ? url : `${API_BASE}${url}`} alt="" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] leading-none"
                    >×</button>
                  </div>
                ))}
                {/* New image previews */}
                {newImagePreviews.map((preview, i) => (
                  <div key={`n-${i}`} className="relative w-16 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    <img src={preview} alt="" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] leading-none"
                    >×</button>
                  </div>
                ))}
                {/* Add button */}
                <label
                  htmlFor="image-upload"
                  className="w-16 h-16 bg-[#1c1c1c] border border-dashed border-[#3a3a3a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#3ECF8E] transition-colors shrink-0 gap-1"
                >
                  <Plus className="w-4 h-4 text-[#4a4a4a]" />
                  <span className="text-[9px] text-[#4a4a4a]">Add</span>
                </label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="image-upload" />
              </div>
              <p className="text-xs text-[#4a4a4a]">PNG, JPG up to 5MB each</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_price">Compare at (R)</Label>
                <Input id="compare_price" type="number" step="0.01" min="0" value={formData.compare_at_price} onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select value={formData.badge} onValueChange={(v) => setFormData({ ...formData, badge: v })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="preorder">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pokemon Set (Optional)</Label>
              <Select value={formData.set_id || 'none'} onValueChange={(v) => setFormData({ ...formData, set_id: v === 'none' ? '' : v })}>
                <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Select a set..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Set</SelectItem>
                  {sets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>{set.name} {set.code ? `(${set.code})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Enter SKU" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="0" value={formData.initial_quantity} onChange={(e) => setFormData({ ...formData, initial_quantity: e.target.value })} />
              </div>
            </div>
            {/* Dimensions — collapsible */}
            <div className="border border-[#282828] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('dimensions')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#c4c4c4] hover:bg-[#1a1a1a] transition-colors"
              >
                Product Dimensions
                <svg className={`w-4 h-4 text-[#6b6b6b] transition-transform duration-200 ${sectionsOpen.dimensions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sectionsOpen.dimensions && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#282828]">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Weight (g)</Label>
                      <Input
                        type="number" min="0" placeholder="e.g. 500"
                        value={formData.dimensions.weight}
                        onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, weight: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Length (cm)</Label>
                      <Input
                        type="number" min="0" placeholder="e.g. 30"
                        value={formData.dimensions.length}
                        onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Width (cm)</Label>
                      <Input
                        type="number" min="0" placeholder="e.g. 20"
                        value={formData.dimensions.width}
                        onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (cm)</Label>
                      <Input
                        type="number" min="0" placeholder="e.g. 10"
                        value={formData.dimensions.height}
                        onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* What's in the box — collapsible */}
            <div className="border border-[#282828] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('box')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#c4c4c4] hover:bg-[#1a1a1a] transition-colors"
              >
                What's in the Box
                <svg className={`w-4 h-4 text-[#6b6b6b] transition-transform duration-200 ${sectionsOpen.box ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sectionsOpen.box && (
                <div className="px-4 pb-4 border-t border-[#282828]">
                  <p className="text-xs text-[#6b6b6b] mt-3 mb-2">One item per line</p>
                  <Textarea
                    rows={5}
                    placeholder={"1x Booster Pack\n1x Promo Card\n1x Coin"}
                    value={formData.box_contents}
                    onChange={(e) => setFormData({ ...formData, box_contents: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-8 pt-1">
              <div className="flex items-center gap-2">
                <Switch id="active" checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label htmlFor="active" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="featured" checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })} />
                <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (uploading ? 'Uploading...' : 'Saving...') : (editingProduct ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-[#282828] border-dashed rounded-xl p-16 text-center">
          <Package className="w-10 h-10 text-[#282828] mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-[#4a4a4a]">
            {search ? `No products matching "${search}"` : 'No products yet — add your first one'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const qty = product.inventory?.quantity || 0;
            const threshold = product.inventory?.low_stock_threshold || 5;

            return (
              <div
                key={product.id}
                className="bg-[#111111] border border-[#282828] rounded-2xl overflow-hidden hover:border-[#3a3a3a] transition-all duration-200 group relative"
              >
                {/* Image */}
                <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}${product.images[0]}`}
                      alt={product.name}
                      className="w-[75%] h-[75%] object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-[#ccc]" strokeWidth={1} />
                  )}

                  {/* Badge */}
                  {product.badge && product.badge !== 'none' && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-900 text-white capitalize">
                      {product.badge}
                    </span>
                  )}

                  {/* Featured star */}
                  {product.is_featured && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                  )}

                  {/* Hover quick-edit */}
                  <button
                    onClick={() => handleEdit(product)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[#0f0f0f]/70 hover:bg-[#0f0f0f]/90 backdrop-blur-sm rounded-md p-1.5"
                  >
                    <Pencil className="w-3 h-3 text-[#f1f1f1]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-[10px] text-[#6b6b6b] uppercase tracking-widest">
                    {product.is_active ? 'Active' : 'Draft'}{product.category ? ` · ${product.category}` : ''}
                  </span>

                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[#f1f1f1] line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#6b6b6b] hover:text-[#f1f1f1] cursor-pointer shrink-0 -mr-1">
                          <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50">Delete</DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-medium text-[#f1f1f1]">
                      R{Number(product.price || 0).toLocaleString()}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-[#4a4a4a] line-through">
                        R{Number(product.compare_at_price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {qty <= threshold && qty > 0 && (
                    <p className="text-xs text-amber-500 mt-0.5">Only {qty} left</p>
                  )}
                  {qty === 0 && (
                    <p className="text-xs text-[#6b6b6b] mt-0.5">Out of stock</p>
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

export default Products;
