import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { packInventoryApi } from '../hooks/useApi';
import { Package, Plus, Trash2, ChevronDown, ChevronUp, X, Search, Film, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common', color: '#6b6b6b' },
  { value: 'uncommon', label: 'Uncommon', color: '#4ade80' },
  { value: 'rare', label: 'Rare', color: '#60a5fa' },
  { value: 'ultra_rare', label: 'Ultra Rare', color: '#f59e0b' },
];

const rarityColor = (r) => RARITY_OPTIONS.find(o => o.value === r)?.color || '#6b6b6b';

// ── Add Pack Modal (multi-step) ──────────────────────────────────────────────
const AddPackModal = ({ knownSets, onClose, onCreated }) => {
  const [step, setStep] = useState(1); // 1 = details, 2 = pick cards
  const [form, setForm] = useState({ set_id: '', set_name: '', pack_number: '', video_url: '' });
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef(null);

  // When set changes, auto-fill set_name and next pack number
  const handleSetChange = async (setId) => {
    const set = knownSets.find(s => s.id === setId);
    setForm(f => ({ ...f, set_id: setId, set_name: set?.name || '' }));
    if (setId) {
      try {
        const { next } = await packInventoryApi.getNextPackNumber(setId);
        setForm(f => ({ ...f, pack_number: String(next) }));
      } catch {}
    }
  };

  // Step 1 → Step 2: load card catalog
  const goToStep2 = async () => {
    setError('');
    if (!form.set_id) { setError('Please select a set'); return; }
    if (!form.pack_number) { setError('Please enter a pack number'); return; }

    try {
      setCatalogLoading(true);
      setStep(2);
      const data = await packInventoryApi.getCardCatalog(form.set_id);
      setCatalog(data.cards || []);
    } catch (err) {
      setError('Failed to load card catalog: ' + (err.message || ''));
      setStep(1);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Filter catalog by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter(c =>
      c.card_name.toLowerCase().includes(q) ||
      c.card_number.toLowerCase().includes(q) ||
      String(c.card_number).padStart(3, '0').includes(q)
    );
  }, [catalog, searchQuery]);

  // Check if a card is already selected
  const isSelected = (cardNumber) => selectedCards.some(c => c.card_number === cardNumber);

  // Toggle card selection
  const toggleCard = (card) => {
    if (isSelected(card.card_number)) {
      setSelectedCards(prev => prev.filter(c => c.card_number !== card.card_number));
    } else {
      setSelectedCards(prev => [...prev, { ...card }]);
    }
  };

  // Remove from selected
  const removeSelected = (cardNumber) => {
    setSelectedCards(prev => prev.filter(c => c.card_number !== cardNumber));
  };

  // Submit
  const handleCreate = async () => {
    if (selectedCards.length === 0) { setError('Add at least one card'); return; }
    setError('');
    try {
      setSaving(true);
      await packInventoryApi.create({
        set_id: form.set_id,
        set_name: form.set_name,
        pack_number: Number(form.pack_number),
        video_url: form.video_url || undefined,
        cards: selectedCards.map(c => ({
          card_name: c.card_name,
          card_number: c.card_number,
          rarity: c.rarity,
          image_url: c.image_url,
          price_zar: c.price_zar,
        })),
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create pack');
    } finally {
      setSaving(false);
    }
  };

  const totalValue = selectedCards.reduce((sum, c) => sum + (Number(c.price_zar) || 0), 0);

  // Focus search on step 2
  useEffect(() => {
    if (step === 2 && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [step, catalogLoading]);

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-[#111111] border border-[#282828] rounded-xl w-full max-w-5xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828]">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-sm font-medium text-[#f1f1f1]">
              {step === 1 ? 'New Pack — Details' : 'New Pack — Pick Cards'}
            </h2>
            <div className="flex items-center gap-1.5 ml-3">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[#3ECF8E]' : 'bg-[#282828]'}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[#3ECF8E]' : 'bg-[#282828]'}`} />
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {/* Step 1: Pack details */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6b6b6b] mb-1.5">Set</label>
                <select
                  value={form.set_id}
                  onChange={e => handleSetChange(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] focus:border-[#3ECF8E] focus:outline-none"
                >
                  <option value="">Select a set...</option>
                  {knownSets.map(s => (
                    <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6b6b6b] mb-1.5">Pack Number</label>
                <input
                  type="number"
                  value={form.pack_number}
                  onChange={e => setForm(f => ({ ...f, pack_number: e.target.value }))}
                  placeholder="1"
                  min="1"
                  className="w-full bg-[#0f0f0f] border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder-[#4a4a4a] focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#6b6b6b] mb-1.5">Video URL (optional)</label>
              <input
                type="url"
                value={form.video_url}
                onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                placeholder="https://youtube.com/..."
                className="w-full bg-[#0f0f0f] border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder-[#4a4a4a] focus:border-[#3ECF8E] focus:outline-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={goToStep2}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3ECF8E] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-[#34b87a] transition-colors"
              >
                Next — Pick Cards
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Visual card picker */}
        {step === 2 && (
          <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            {/* Selected cards strip */}
            {selectedCards.length > 0 && (
              <div className="px-6 py-3 border-b border-[#282828] bg-[#0f0f0f]">
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {selectedCards.map(card => (
                    <div key={card.card_number} className="relative shrink-0 group">
                      <img
                        src={card.image_url}
                        alt={card.card_name}
                        className="w-20 h-[112px] object-cover rounded-md border border-[#282828]"
                      />
                      <button
                        onClick={() => removeSelected(card.card_number)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="px-6 py-3 border-b border-[#282828]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or card number..."
                  className="w-full bg-[#0f0f0f] border border-[#282828] rounded-lg pl-10 pr-3 py-2.5 text-sm text-[#f1f1f1] placeholder-[#4a4a4a] focus:border-[#3ECF8E] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#f1f1f1]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {catalogLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-[#6b6b6b]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading card catalog...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-[#6b6b6b] text-center py-12">
                  {searchQuery ? 'No cards match your search.' : 'No cards in catalog.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filtered.map(card => {
                    const selected = isSelected(card.card_number);
                    return (
                      <button
                        key={card.card_number}
                        onClick={() => toggleCard(card)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          selected
                            ? 'border-[#3ECF8E] ring-1 ring-[#3ECF8E]/30 scale-[0.96]'
                            : 'border-transparent hover:border-[#282828]'
                        }`}
                      >
                        <img
                          src={card.image_url}
                          alt={card.card_name}
                          className="w-full aspect-[2.5/3.5] object-cover"
                          loading="lazy"
                        />
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#3ECF8E] rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-[#0f0f0f]" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#282828] flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                {selectedCards.length > 0 && (
                  <span className="text-xs text-[#6b6b6b]">
                    {selectedCards.length} cards
                  </span>
                )}
                <button
                  onClick={handleCreate}
                  disabled={saving || selectedCards.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#3ECF8E] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-[#34b87a] disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create Pack'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const PackInventory = () => {
  const [packs, setPacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPack, setExpandedPack] = useState(null);
  const [expandedCards, setExpandedCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [knownSets, setKnownSets] = useState([]);
  const [filter, setFilter] = useState({ set_id: '', status: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.set_id) params.set_id = filter.set_id;
      if (filter.status) params.status = filter.status;
      const [packsRes, statsRes] = await Promise.all([
        packInventoryApi.getAll(params),
        packInventoryApi.getStats(),
      ]);
      setPacks(packsRes.packs || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to fetch pack inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load known sets on mount
  useEffect(() => {
    packInventoryApi.getKnownSets().then(setKnownSets).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [filter.set_id, filter.status]);

  const handleExpandPack = async (packId) => {
    if (expandedPack === packId) {
      setExpandedPack(null);
      setExpandedCards([]);
      return;
    }
    try {
      const data = await packInventoryApi.get(packId);
      setExpandedPack(packId);
      setExpandedCards(data.pack_cards || []);
    } catch (err) {
      console.error('Failed to fetch pack details:', err);
    }
  };

  const handleDelete = async (packId) => {
    if (!confirm('Delete this pack? This cannot be undone.')) return;
    try {
      await packInventoryApi.delete(packId);
      setPacks(prev => prev.filter(p => p.id !== packId));
      if (expandedPack === packId) { setExpandedPack(null); setExpandedCards([]); }
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete pack');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f1f1]">Pack Inventory</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            Manage real packs opened on camera. Users get assigned a random pack from inventory.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3ECF8E] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-[#34b87a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pack
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Packs', value: stats.total, color: '#f1f1f1' },
            { label: 'Available', value: stats.available, color: '#3ECF8E' },
            { label: 'Sold', value: stats.sold, color: '#f59e0b' },
            { label: 'Reserved', value: stats.reserved, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} className="bg-[#171717] border border-[#282828] rounded-lg p-4">
              <div className="text-xs text-[#6b6b6b]">{s.label}</div>
              <div className="text-xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Set breakdown */}
      {stats?.sets?.length > 0 && (
        <div className="bg-[#171717] border border-[#282828] rounded-lg p-4">
          <div className="text-xs text-[#6b6b6b] mb-3">Inventory by Set</div>
          <div className="flex flex-wrap gap-3">
            {stats.sets.map(s => (
              <div key={s.set_id} className="flex items-center gap-2 text-sm">
                <span className="text-[#a0a0a0]">{s.set_name}</span>
                <span className="text-[#3ECF8E]">{s.available}</span>
                <span className="text-[#6b6b6b]">/</span>
                <span className="text-[#6b6b6b]">{s.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="bg-[#171717] border border-[#282828] rounded-lg px-3 py-2 text-sm text-[#f1f1f1] focus:border-[#3ECF8E] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
        </select>
        {stats?.sets?.length > 0 && (
          <select
            value={filter.set_id}
            onChange={e => setFilter(f => ({ ...f, set_id: e.target.value }))}
            className="bg-[#171717] border border-[#282828] rounded-lg px-3 py-2 text-sm text-[#f1f1f1] focus:border-[#3ECF8E] focus:outline-none"
          >
            <option value="">All Sets</option>
            {stats.sets.map(s => (
              <option key={s.set_id} value={s.set_id}>{s.set_name} ({s.total})</option>
            ))}
          </select>
        )}
      </div>

      {/* Pack list — table */}
      {loading ? (
        <div className="text-sm text-[#6b6b6b] py-12 text-center">Loading...</div>
      ) : packs.length === 0 ? (
        <div className="border border-[#282828] bg-[#171717] rounded-lg p-12 text-center">
          <Package className="w-10 h-10 text-[#4a4a4a] mx-auto mb-3" />
          <p className="text-sm text-[#6b6b6b]">No packs found. Add your first pack above.</p>
        </div>
      ) : (() => {
        const statusDot = (s) => {
          if (s === 'available') return 'bg-[#3ECF8E]';
          if (s === 'reserved') return 'bg-[#60a5fa]';
          return 'bg-[#f59e0b]';
        };
        const statusLabel = (s) => {
          if (s === 'available') return 'text-[#3ECF8E]';
          if (s === 'reserved') return 'text-[#60a5fa]';
          return 'text-[#f59e0b]';
        };

        // Group: available → reserved → sold
        const sorted = [...packs].sort((a, b) => {
          const order = { available: 0, reserved: 1, sold: 2 };
          return (order[a.status] ?? 3) - (order[b.status] ?? 3);
        });

        return (
          <div className="bg-[#171717] border border-[#282828] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#282828] text-[#6b6b6b] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Set</th>
                  <th className="text-left px-4 py-3 font-medium">Pack #</th>
                  <th className="text-left px-4 py-3 font-medium">Cards</th>
                  <th className="text-left px-4 py-3 font-medium">Value</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Video</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(pack => (
                  <Fragment key={pack.id}>
                    <tr
                      className={`border-b border-[#282828] cursor-pointer hover:bg-[#1c1c1c] transition-colors ${pack.status === 'sold' ? 'opacity-60' : ''}`}
                      onClick={() => handleExpandPack(pack.id)}
                    >
                      <td className="px-4 py-3 text-[#f1f1f1] font-medium">{pack.set_name}</td>
                      <td className="px-4 py-3 text-[#a0a0a0]">#{pack.pack_number}</td>
                      <td className="px-4 py-3 text-[#a0a0a0]">{pack.card_count}</td>
                      <td className="px-4 py-3 text-[#f1f1f1]">R{(pack.total_value_zar || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(pack.status)}`} />
                          <span className={`text-xs capitalize ${statusLabel(pack.status)}`}>{pack.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pack.video_url ? <Film className="w-3.5 h-3.5 text-[#6b6b6b]" /> : <span className="text-[#4a4a4a]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(pack.id); }}
                            className="text-[#6b6b6b] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedPack === pack.id
                            ? <ChevronUp className="w-4 h-4 text-[#6b6b6b]" />
                            : <ChevronDown className="w-4 h-4 text-[#6b6b6b]" />
                          }
                        </div>
                      </td>
                    </tr>
                    {expandedPack === pack.id && expandedCards.length > 0 && (
                      <tr className={pack.status === 'sold' ? 'opacity-60' : ''}>
                        <td colSpan={7} className="bg-[#141414] px-4 py-4">
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {expandedCards.map(card => (
                              <div key={card.id} className="shrink-0">
                                {card.image_url ? (
                                  <img src={card.image_url} alt={card.card_name} className="w-16 h-[90px] object-cover rounded-md border border-[#282828]" />
                                ) : (
                                  <div className="w-16 h-[90px] bg-[#1c1c1c] border border-[#282828] rounded-md flex items-center justify-center">
                                    <span className="text-[9px] text-[#6b6b6b] text-center px-1">{card.card_name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {pack.assigned_to && (
                            <div className="mt-3 pt-3 border-t border-[#282828] text-xs text-[#6b6b6b]">
                              Assigned to: {pack.assigned_to} at {new Date(pack.assigned_at).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Add Pack Modal */}
      {showModal && (
        <AddPackModal
          knownSets={knownSets}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default PackInventory;
