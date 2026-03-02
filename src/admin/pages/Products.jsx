import { useState, useEffect } from 'react';
import { productsApi, uploadApi, setsApi } from '../hooks/useApi';
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

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'booster_box', label: 'Booster Boxes' },
  { value: 'etb', label: 'ETBs' },
  { value: 'singles', label: 'Singles' },
  { value: 'collection', label: 'Collections' },
  { value: 'accessories', label: 'Accessories' },
];

const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'ZAR': return 'R';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return 'R';
  }
};

const getStockColor = () => '#3a3a3a';

const SkeletonCard = () => (
  <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-[#1a1a1a]" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-[#1e1e1e] rounded-md w-3/4" />
      <div className="h-3 bg-[#1e1e1e] rounded-md w-1/3" />
      <div className="flex gap-1.5 pt-1">
        <div className="h-4 w-12 bg-[#1e1e1e] rounded-full" />
        <div className="h-4 w-16 bg-[#1e1e1e] rounded-full" />
      </div>
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sets, setSets] = useState([]);
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
    currency: 'ZAR',
    category: 'booster_box',
    badge: 'none',
    sku: '',
    set_id: '',
    initial_quantity: '0',
    low_stock_threshold: '5',
    is_active: true,
    is_featured: false,
    images: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  useEffect(() => {
    fetchProducts();
    fetchSets();
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
      currency: 'ZAR', category: 'booster_box', badge: 'none', sku: '',
      set_id: '', initial_quantity: '0', low_stock_threshold: '5',
      is_active: true, is_featured: false, images: [],
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
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
      let imageUrl = formData.images[0] || null;
      if (imageFile) {
        setUploading(true);
        const uploadResult = await uploadApi.uploadImage(imageFile);
        imageUrl = uploadResult.url;
        setUploading(false);
      }
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        initial_quantity: parseInt(formData.initial_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        images: imageUrl ? [imageUrl] : [],
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
      currency: product.currency || 'ZAR',
      category: product.category || 'booster_box',
      badge: product.badge || 'none',
      sku: product.sku || '',
      set_id: product.set_id || '',
      initial_quantity: product.inventory?.quantity?.toString() || '0',
      low_stock_threshold: product.inventory?.low_stock_threshold?.toString() || '5',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      images: product.images || [],
    });
    if (product.images?.[0]) {
      setImagePreview(product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}${product.images[0]}`);
    }
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
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                filter === cat.value
                  ? 'bg-[#1e1e1e] text-[#f1f1f1] border-[#3a3a3a]'
                  : 'bg-transparent text-[#6b6b6b] border-[#282828] hover:border-[#333] hover:text-[#c4c4c4]'
              }`}
            >
              {cat.label}
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
              <Label>Product Image</Label>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#4a4a4a]" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4" strokeWidth={1.5} />
                      Choose Image
                    </label>
                  </Button>
                  <p className="text-xs text-[#4a4a4a]">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_price">Compare at</Label>
                <Input id="compare_price" type="number" step="0.01" min="0" value={formData.compare_at_price} onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">ZAR (R)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booster_box">Booster Box</SelectItem>
                    <SelectItem value="etb">Elite Trainer Box</SelectItem>
                    <SelectItem value="singles">Singles</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
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
            const stockPct = Math.min(100, (qty / (threshold * 6)) * 100);
            const stockColor = getStockColor(qty, threshold);

            return (
              <div
                key={product.id}
                className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all duration-200 group relative"
              >
                {/* Image */}
                <div
                  className="aspect-video isolate flex items-center justify-center p-5 border-b border-[#1e1e1e] relative overflow-hidden"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}${product.images[0]}`}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-[#ccc]" strokeWidth={1} />
                  )}

                  {/* Featured badge */}
                  {product.is_featured && (
                    <div className="absolute top-2 left-2 bg-[#0f0f0f]/70 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-[#f1f1f1] fill-[#f1f1f1]" />
                      <span className="text-[9px] font-medium text-[#f1f1f1] uppercase tracking-wide">Featured</span>
                    </div>
                  )}

                  {/* Hover quick-edit */}
                  <button
                    onClick={() => handleEdit(product)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[#0f0f0f]/70 hover:bg-[#0f0f0f]/90 backdrop-blur-sm rounded-md p-1.5"
                  >
                    <Pencil className="w-3 h-3 text-[#f1f1f1]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-[#f1f1f1] truncate leading-snug">{product.name}</p>
                      <p className="text-sm text-[#a0a0a0] mt-1">
                        {getCurrencySymbol(product.currency)}{product.price}
                        {product.compare_at_price && (
                          <span className="ml-1.5 line-through text-[#4a4a4a] text-xs">{getCurrencySymbol(product.currency)}{product.compare_at_price}</span>
                        )}
                      </p>
                    </div>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6b6b6b] hover:text-[#f1f1f1] cursor-pointer shrink-0 -mr-1 -mt-1">
                          <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50">Delete</DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 text-[10px] rounded-full border bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]">
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                    {product.badge && product.badge !== 'none' && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#282828] text-[#a0a0a0] border border-[#333] capitalize">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Stock bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#4a4a4a]">Stock</span>
                      <span className="text-[10px] text-[#4a4a4a]">{qty} left</span>
                    </div>
                    <div className="h-0.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stockPct}%`, backgroundColor: stockColor }}
                      />
                    </div>
                  </div>
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
