import { useState, useEffect } from 'react';
import { bannersApi, setsApi, uploadApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Plus, Upload, Image as ImageIcon, MoreVertical, Layers } from 'lucide-react';
import { ELITE_API_URL } from '@/config/api';

const API_BASE = ELITE_API_URL;

const imgSrc = (url) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

const EMPTY_FORM = {
  type: 'set',
  title: '',
  subtitle: '',
  label: '',
  image_url: '',
  mobile_image_url: '',
  set_id: '',
  cta_label: 'Shop Now',
  cta_url: '',
  is_active: true,
  display_order: 0,
  svg_template: 1,
};

const SVG_TEMPLATES = [
  { id: 1, label: 'Stripes',   desc: 'Diagonal lines + hexagons' },
  { id: 2, label: 'Circles',   desc: 'Overlapping ring outlines' },
  { id: 3, label: 'Grid',      desc: 'Dot grid + arc' },
  { id: 4, label: 'Triangles', desc: 'Fragments & diamonds' },
  { id: 5, label: 'Waves',     desc: 'Flowing arcs' },
];

const ImageUploadSlot = ({ id, label, hint, file, preview, onChange }) => (
  <div className="space-y-1.5">
    <p className="text-xs text-[#6b6b6b]">{label}</p>
    <div className="w-full h-20 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex items-center justify-center">
      {preview
        ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        : <ImageIcon className="w-6 h-6 text-[#4a4a4a]" strokeWidth={1} />
      }
    </div>
    <input type="file" accept="image/*" onChange={onChange} className="hidden" id={id} />
    <Button type="button" variant="outline" size="sm" asChild className="w-full gap-1.5">
      <label htmlFor={id} className="cursor-pointer justify-center">
        <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
        {file ? 'Replace' : 'Upload'}
      </label>
    </Button>
    <p className="text-[10px] text-[#4a4a4a] text-center">{hint}</p>
  </div>
);

const Banners = () => {
  const [banners, setBanners]           = useState([]);
  const [sets, setSets]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingBanner, setEditing]     = useState(null);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [message, setMessage]           = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [desktopFile, setDesktopFile]   = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobileFile, setMobileFile]     = useState(null);
  const [mobilePreview, setMobilePreview]   = useState(null);

  const fetchBanners = async () => {
    try {
      const data = await bannersApi.getAll({ admin: 'true' });
      setBanners(data.banners || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load banners' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBanners();
    setsApi.getAll({ active: 'all' }).then(d => setSets(d.sets || [])).catch(() => {});
  }, []);

  const reset = () => {
    setFormData(EMPTY_FORM);
    setDesktopFile(null); setDesktopPreview(null);
    setMobileFile(null);  setMobilePreview(null);
    setEditing(null);
  };

  const makePreview = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      setUploading(true);
      let image_url        = formData.image_url || null;
      let mobile_image_url = formData.mobile_image_url || null;

      if (desktopFile) {
        const result = await uploadApi.uploadImage(desktopFile);
        image_url = result.url;
      }
      if (mobileFile) {
        const result = await uploadApi.uploadImage(mobileFile);
        mobile_image_url = result.url;
      }
      setUploading(false);

      const payload = {
        ...formData,
        image_url,
        mobile_image_url,
        set_id:        formData.set_id || null,
        title:         formData.title || null,
        subtitle:      formData.subtitle || null,
        label:         formData.label || null,
        cta_url:       formData.cta_url || null,
        display_order: Number(formData.display_order) || 0,
      };

      if (editingBanner) {
        await bannersApi.update(editingBanner.id, payload);
        setMessage({ type: 'success', text: 'Banner updated' });
      } else {
        await bannersApi.create(payload);
        setMessage({ type: 'success', text: 'Banner created' });
      }

      reset();
      setShowForm(false);
      fetchBanners();
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally { setSaving(false); setUploading(false); }
  };

  const handleEdit = (b) => {
    setEditing(b);
    setFormData({
      type:             b.type || 'set',
      title:            b.title || '',
      subtitle:         b.subtitle || '',
      label:            b.label || '',
      image_url:        b.image_url || '',
      mobile_image_url: b.mobile_image_url || '',
      set_id:           b.set_id || '',
      cta_label:        b.cta_label ?? '',
      cta_url:          b.cta_url || '',
      is_active:        b.is_active ?? true,
      display_order:    b.display_order ?? 0,
      svg_template:     b.svg_template ?? 1,
    });
    setDesktopPreview(imgSrc(b.image_url));
    setMobilePreview(imgSrc(b.mobile_image_url));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await bannersApi.remove(id);
      setMessage({ type: 'success', text: 'Banner deleted' });
      fetchBanners();
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to delete' });
    }
  };

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Banners</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">{banners.length} banners</p>
        </div>
        <button
          onClick={() => { reset(); setShowForm(true); }}
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6b6b] text-sm">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="border border-[#282828] rounded-xl p-16 text-center text-[#6b6b6b] text-sm">
          No banners yet. Add one to control your homepage spotlight.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden group">
              <div className="relative aspect-video bg-[#1a1a1a] flex items-center justify-center">
                {b.type === 'image' && b.image_url ? (
                  <img src={imgSrc(b.image_url)} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
                ) : b.type === 'set' && b.set?.logo_url ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#111] p-6">
                    <img src={imgSrc(b.set.logo_url)} alt={b.set.name} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <Layers className="w-10 h-10 text-[#4a4a4a]" strokeWidth={1} />
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-black/60 text-white/70 backdrop-blur-sm">
                  {b.type === 'image' ? 'Image' : 'Set'}
                </span>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/40 text-white backdrop-blur-sm">
                      <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Button>
                  }>
                    <DropdownMenuItem onClick={() => handleEdit(b)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(b.id)} className="text-red-500">Delete</DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[14px] font-medium text-[#f1f1f1] truncate">
                  {b.title || b.set?.name || 'Untitled'}
                </p>
                <p className="text-xs text-[#6b6b6b] mt-0.5 truncate">
                  {b.subtitle || b.cta_url || '—'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${b.is_active ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#1e1e1e] text-[#6b6b6b] border border-[#2e2e2e]">
                    Order {b.display_order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); reset(); } }}>
        <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              {editingBanner ? 'Edit Banner' : 'New Banner'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type toggle */}
            <div className="space-y-2">
              <Label>Banner Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'set',   label: 'Set Banner',   desc: 'Links to a Pokémon set with dynamic styling' },
                  { value: 'image', label: 'Image Banner',  desc: 'Upload a full Canva-designed banner' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('type', opt.value)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${formData.type === opt.value ? 'border-dashed border-[#3ECF8E] text-[#3ECF8E]' : 'border-[#282828] bg-[#111] text-[#6b6b6b] hover:border-[#333]'}`}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SET TYPE fields */}
            {formData.type === 'set' && (
              <>
                <div className="space-y-2">
                  <Label>Set</Label>
                  <select
                    value={formData.set_id}
                    onChange={(e) => set('set_id', e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] outline-none focus:border-[#3ECF8E] transition-colors"
                  >
                    <option value="">Select a set...</option>
                    {sets.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Graphic Style</Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SVG_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set('svg_template', t.id)}
                        title={t.desc}
                        className={`py-2 rounded-lg border text-xs transition-colors ${formData.svg_template === t.id ? 'border-dashed border-[#3ECF8E] text-[#3ECF8E]' : 'border-[#282828] bg-[#111] text-[#6b6b6b] hover:border-[#333]'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* IMAGE TYPE fields — desktop + mobile uploads */}
            {formData.type === 'image' && (
              <div className="space-y-2">
                <Label>Banner Images</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ImageUploadSlot
                    id="banner-img-desktop"
                    label="Desktop"
                    hint="1920×640px recommended"
                    file={desktopFile}
                    preview={desktopPreview}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setDesktopFile(f);
                      makePreview(f, setDesktopPreview);
                    }}
                  />
                  <ImageUploadSlot
                    id="banner-img-mobile"
                    label="Mobile"
                    hint="768×600px recommended"
                    file={mobileFile}
                    preview={mobilePreview}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setMobileFile(f);
                      makePreview(f, setMobilePreview);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Shared fields */}
            <div className="space-y-2">
              <Label htmlFor="label">Label <span className="text-[#4a4a4a] font-normal">(e.g. New Release · leave blank to hide)</span></Label>
              <Input id="label" value={formData.label} onChange={(e) => set('label', e.target.value)}
                placeholder="New Release" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-[#4a4a4a] font-normal">(optional override)</span></Label>
              <Input id="title" value={formData.title} onChange={(e) => set('title', e.target.value)}
                placeholder={formData.type === 'set' ? 'Defaults to set name' : 'Banner headline'} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle <span className="text-[#4a4a4a] font-normal">(optional)</span></Label>
              <Input id="subtitle" value={formData.subtitle} onChange={(e) => set('subtitle', e.target.value)}
                placeholder="e.g. The latest expansion is here" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cta_label">Button Label <span className="text-[#4a4a4a] font-normal">(blank = hidden)</span></Label>
                <Input id="cta_label" value={formData.cta_label} onChange={(e) => set('cta_label', e.target.value)} placeholder="Shop Now" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_url">Button URL <span className="text-[#4a4a4a] font-normal">(optional)</span></Label>
                <Input id="cta_url" value={formData.cta_url} onChange={(e) => set('cta_url', e.target.value)} placeholder="/sets/..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input id="display_order" type="number" min="0" value={formData.display_order}
                  onChange={(e) => set('display_order', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(v) => set('is_active', v)} />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282828]">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>
                {uploading ? 'Uploading...' : saving ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Banners;
