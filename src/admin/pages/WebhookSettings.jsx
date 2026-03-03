import { useState, useEffect } from 'react';
import { webhookApi } from '../hooks/useApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Send, Loader2 } from 'lucide-react';

const EVENTS = [
  { key: 'softbounce', label: 'Soft Bounces' },
  { key: 'hardbounce', label: 'Hard Bounces' },
  { key: 'click', label: 'Click' },
  { key: 'open', label: 'Open' },
  { key: 'feedback_loop', label: 'Feedback Loop' },
];

const PROVIDERS = [
  { value: 'zeptomail', label: 'ZeptoMail' },
];

const emptyForm = {
  provider: 'zeptomail',
  webhook_url: '',
  auth_header_key: '',
  auth_header_value: '',
  events_enabled: { softbounce: false, hardbounce: false, click: false, open: false, feedback_loop: false },
  is_active: true,
  description: '',
};

const WebhookSettings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editing, setEditing] = useState(null); // null = list view, 'new' or id = form view
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null); // webhook id being tested

  const fetchConfigs = async () => {
    try {
      const data = await webhookApi.getAll();
      setConfigs(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load webhooks' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleEdit = (config) => {
    setEditing(config.id);
    setForm({
      provider: config.provider,
      webhook_url: config.webhook_url,
      auth_header_key: config.auth_header_key || '',
      auth_header_value: '',  // Never pre-populated (masked in API response)
      events_enabled: config.events_enabled || { ...emptyForm.events_enabled },
      is_active: config.is_active,
      description: config.description || '',
    });
    setMessage(null);
  };

  const handleNew = () => {
    setEditing('new');
    setForm({ ...emptyForm });
    setMessage(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.webhook_url.trim()) {
      setMessage({ type: 'error', text: 'Webhook URL is required' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        auth_header_key: form.auth_header_key || null,
        auth_header_value: form.auth_header_value || null,
        description: form.description || null,
      };
      if (editing === 'new') {
        await webhookApi.create(payload);
      } else {
        // On update, omit auth_header_value if blank (keeps existing value)
        const updatePayload = { ...payload };
        if (!updatePayload.auth_header_value) {
          delete updatePayload.auth_header_value;
        }
        await webhookApi.update(editing, updatePayload);
      }
      setMessage({ type: 'success', text: editing === 'new' ? 'Webhook created' : 'Webhook updated' });
      setEditing(null);
      await fetchConfigs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this webhook configuration?')) return;
    try {
      await webhookApi.delete(id);
      setMessage({ type: 'success', text: 'Webhook deleted' });
      await fetchConfigs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete' });
    }
  };

  const handleTest = async (id) => {
    setTesting(id);
    setMessage(null);
    try {
      const result = await webhookApi.test(id);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Test failed' });
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (key) => {
    setForm((prev) => ({
      ...prev,
      events_enabled: { ...prev.events_enabled, [key]: !prev.events_enabled[key] },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#6b6b6b] text-sm">Loading...</div>
    );
  }

  // Form view (create/edit)
  if (editing !== null) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-base font-medium text-[#f1f1f1]">
            {editing === 'new' ? 'Add Webhook' : 'Edit Webhook'}
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            Configure webhook endpoint for email event notifications
          </p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="max-w-[640px] space-y-8">
          {/* Provider & URL */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-[#f1f1f1]">Endpoint</h2>
              <p className="text-xs text-[#6b6b6b] mt-0.5">Webhook URL and provider</p>
            </div>
            <div className="bg-[#111111] border border-[#282828] rounded-xl p-5 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    className="w-full h-10 px-3 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] focus:outline-none"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <span className="text-sm text-[#a0a0a0]">{form.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL *</Label>
                <Input
                  id="webhook-url"
                  value={form.webhook_url}
                  onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                  placeholder="https://your-domain.com/webhooks/email"
                />
                <p className="text-xs text-[#4a4a4a]">API call should be unauthenticated and return status 200</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-desc">Description</Label>
                <Input
                  id="webhook-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Production bounce handler"
                />
              </div>
            </div>
          </section>

          {/* Authorization */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-[#f1f1f1]">Authorization Headers</h2>
              <p className="text-xs text-[#6b6b6b] mt-0.5">Optional authentication for webhook requests</p>
            </div>
            <div className="bg-[#111111] border border-[#282828] rounded-xl p-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="auth-key">Header Key</Label>
                  <Input
                    id="auth-key"
                    value={form.auth_header_key}
                    onChange={(e) => setForm({ ...form, auth_header_key: e.target.value })}
                    placeholder="Authorization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-value">Header Value</Label>
                  <Input
                    id="auth-value"
                    value={form.auth_header_value}
                    onChange={(e) => setForm({ ...form, auth_header_value: e.target.value })}
                    placeholder={editing !== 'new' ? 'Leave blank to keep current value' : 'Bearer your-secret-key'}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Events */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-[#f1f1f1]">Events</h2>
              <p className="text-xs text-[#6b6b6b] mt-0.5">Choose which events should trigger this webhook</p>
            </div>
            <div className="bg-[#111111] border border-[#282828] rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {EVENTS.map((evt) => (
                  <label
                    key={evt.key}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={form.events_enabled[evt.key] || false}
                      onChange={() => toggleEvent(evt.key)}
                      className="w-4 h-4 rounded border-[#282828] bg-[#1c1c1c] text-[#3ECF8E] focus:ring-[#3ECF8E] focus:ring-offset-0"
                    />
                    <span className="text-sm text-[#a0a0a0]">{evt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editing === 'new' ? 'Add Webhook' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Webhooks</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">Manage webhook endpoints for email event notifications</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Webhook
        </button>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' : 'bg-red-950/30 text-red-400 border-red-900/30'}`}>
          {message.text}
        </div>
      )}

      {configs.length === 0 ? (
        <div className="border border-[#282828] bg-[#111111] rounded-xl p-12 text-center">
          <p className="text-sm text-[#6b6b6b]">No webhooks configured yet</p>
          <button
            onClick={handleNew}
            className="mt-4 text-sm text-[#3ECF8E] hover:text-[#2db87a] transition-colors"
          >
            Add your first webhook
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((config) => {
            const enabledEvents = EVENTS.filter((e) => config.events_enabled?.[e.key]);
            return (
              <div
                key={config.id}
                className="bg-[#111111] border border-[#282828] rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-sm font-medium text-[#f1f1f1] truncate">
                        {config.webhook_url}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${config.is_active ? 'bg-[#3ECF8E]/10 text-[#3ECF8E]' : 'bg-[#282828] text-[#6b6b6b]'}`}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                      <span className="uppercase font-medium">{config.provider}</span>
                      {config.description && (
                        <>
                          <span className="text-[#282828]">|</span>
                          <span>{config.description}</span>
                        </>
                      )}
                    </div>

                    {enabledEvents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {enabledEvents.map((e) => (
                          <span key={e.key} className="px-2 py-0.5 text-[10px] font-medium bg-[#1c1c1c] border border-[#282828] rounded text-[#a0a0a0]">
                            {e.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTest(config.id)}
                      disabled={testing === config.id}
                      className="p-2 text-[#6b6b6b] hover:text-[#3ECF8E] transition-colors disabled:opacity-50"
                      title="Send test event"
                    >
                      {testing === config.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <Send className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(config)}
                      className="px-3 py-1.5 text-xs font-medium text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="p-2 text-[#6b6b6b] hover:text-red-400 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
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

export default WebhookSettings;
