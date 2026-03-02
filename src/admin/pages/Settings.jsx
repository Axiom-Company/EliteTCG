import { useState, useEffect } from 'react';
import { configApi } from '../hooks/useApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementBgColor, setAnnouncementBgColor] = useState('#E3350D');
  const [announcementTextColor, setAnnouncementTextColor] = useState('#FFFFFF');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementDismissible, setAnnouncementDismissible] = useState(false);
  const [announcementFontSize, setAnnouncementFontSize] = useState('sm');
  const [announcementIcon, setAnnouncementIcon] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { config: data } = await configApi.getAll();
        setAnnouncementText(data.announcement_bar_text?.value || '');
        setAnnouncementEnabled(data.announcement_bar_enabled?.value === 'true');
        setAnnouncementBgColor(data.announcement_bar_bg_color?.value || '#E3350D');
        setAnnouncementTextColor(data.announcement_bar_text_color?.value || '#FFFFFF');
        setAnnouncementLink(data.announcement_bar_link?.value || '');
        setAnnouncementDismissible(data.announcement_bar_dismissible?.value === 'true');
        setAnnouncementFontSize(data.announcement_bar_font_size?.value || 'sm');
        setAnnouncementIcon(data.announcement_bar_icon?.value || '');
        setFreeShippingThreshold(data.free_shipping_threshold?.value || '50');
        setLowStockThreshold(data.low_stock_threshold?.value || '5');
      } catch (error) {
        console.error('Fetch config error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await configApi.bulkUpdate({
        announcement_bar_text: announcementText,
        announcement_bar_enabled: String(announcementEnabled),
        announcement_bar_bg_color: announcementBgColor,
        announcement_bar_text_color: announcementTextColor,
        announcement_bar_link: announcementLink,
        announcement_bar_dismissible: String(announcementDismissible),
        announcement_bar_font_size: announcementFontSize,
        announcement_bar_icon: announcementIcon,
        free_shipping_threshold: freeShippingThreshold,
        low_stock_threshold: lowStockThreshold,
      });
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#6b6b6b] text-sm">Loading...</div>
    );
  }

  const fontSizeClass = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[announcementFontSize] || 'text-xs';

  return (
    <div>
      {/* Live announcement bar preview — sticky below admin nav */}
      {announcementEnabled && announcementText && (
        <div className="sticky top-[52px] z-50 -mx-8 -mt-8 mb-8">
          <div
            className="relative flex items-center justify-center px-4 py-2 text-center"
            style={{ backgroundColor: announcementBgColor, color: announcementTextColor }}
          >
            <span className={`${fontSizeClass} font-medium`}>
              {announcementIcon && <span className="mr-2">{announcementIcon}</span>}
              {announcementText}
            </span>
            {announcementDismissible && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 text-xs">x</span>
            )}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wider opacity-40">
              Preview
            </span>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-base font-medium text-[#f1f1f1]">Settings</h1>
        <p className="text-sm text-[#6b6b6b] mt-0.5">Configure your store</p>
      </div>

      <form onSubmit={handleSave} className="max-w-[640px] space-y-8">
        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
            {message.text}
          </div>
        )}

        {/* Announcement Bar */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[#f1f1f1]">Announcement Bar</h2>
            <p className="text-xs text-[#6b6b6b] mt-0.5">Banner displayed at the top of your store</p>
          </div>

          <div className="bg-[#111111] border border-[#282828] rounded-xl p-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="announcement-text">Text</Label>
              <Input
                id="announcement-text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Free shipping on orders over R500!"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="announcement-link">Link URL (optional)</Label>
                <Input
                  id="announcement-link"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="/shop"
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch checked={announcementEnabled} onCheckedChange={setAnnouncementEnabled} />
                  <span className="text-sm text-[#a0a0a0]">{announcementEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={announcementBgColor}
                    onChange={(e) => setAnnouncementBgColor(e.target.value)}
                    className="w-10 h-10 p-0.5 bg-[#1c1c1c] border border-[#282828] rounded-lg cursor-pointer"
                  />
                  <Input value={announcementBgColor} onChange={(e) => setAnnouncementBgColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={announcementTextColor}
                    onChange={(e) => setAnnouncementTextColor(e.target.value)}
                    className="w-10 h-10 p-0.5 bg-[#1c1c1c] border border-[#282828] rounded-lg cursor-pointer"
                  />
                  <Input value={announcementTextColor} onChange={(e) => setAnnouncementTextColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <select
                  value={announcementFontSize}
                  onChange={(e) => setAnnouncementFontSize(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] focus:outline-none"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-icon">Icon / Emoji</Label>
                <Input
                  id="announcement-icon"
                  value={announcementIcon}
                  onChange={(e) => setAnnouncementIcon(e.target.value)}
                  placeholder="e.g. * or ->"
                />
              </div>
              <div className="space-y-2">
                <Label>Dismissible</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch checked={announcementDismissible} onCheckedChange={setAnnouncementDismissible} />
                  <span className="text-sm text-[#a0a0a0]">{announcementDismissible ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#1e1e1e]" />

        {/* Store Settings */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-medium text-[#f1f1f1]">Store Settings</h2>
            <p className="text-xs text-[#6b6b6b] mt-0.5">General store configuration</p>
          </div>

          <div className="bg-[#111111] border border-[#282828] rounded-xl p-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="free-shipping">Free Shipping Threshold (R)</Label>
                <Input
                  id="free-shipping"
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  min="0"
                  step="1"
                />
                <p className="text-xs text-[#4a4a4a]">Orders above this get free shipping</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="low-stock">Low Stock Threshold</Label>
                <Input
                  id="low-stock"
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  min="0"
                  step="1"
                />
                <p className="text-xs text-[#4a4a4a]">Alert when inventory falls below this</p>
              </div>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
