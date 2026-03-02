import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ELITE_API_URL, getImageUrl } from '../../config/api';
import {
  getPortfolio,
  addToPortfolio,
  updatePortfolioCard,
  removeFromPortfolio,
  searchCards,
  getPortfolioSummary,
  getPortfolioHistory,
} from '../../services/portfolioApi';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Search, Plus, Minus, Trash2, TrendingUp, TrendingDown, Layers,
  BarChart3, ChevronDown, X, Package, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── helpers ──────────────────────────────────────────────── */

const formatZAR = (v) => `R${Number(v || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RARITY_COLORS = {
  'Common': 'bg-gray-100 text-gray-700',
  'Uncommon': 'bg-green-50 text-green-700',
  'Rare': 'bg-blue-50 text-blue-700',
  'Rare Holo': 'bg-indigo-50 text-indigo-700',
  'Rare Holo EX': 'bg-purple-50 text-purple-700',
  'Rare Holo GX': 'bg-purple-50 text-purple-700',
  'Rare Holo V': 'bg-violet-50 text-violet-700',
  'Rare VMAX': 'bg-fuchsia-50 text-fuchsia-700',
  'Rare Ultra': 'bg-amber-50 text-amber-700',
  'Rare Secret': 'bg-yellow-50 text-yellow-800',
  'Illustration Rare': 'bg-pink-50 text-pink-700',
  'Special Art Rare': 'bg-rose-50 text-rose-700',
  'Hyper Rare': 'bg-red-50 text-red-700',
};

const CONDITION_OPTIONS = [
  { value: 'NM', label: 'Near Mint' },
  { value: 'LP', label: 'Lightly Played' },
  { value: 'MP', label: 'Moderately Played' },
  { value: 'HP', label: 'Heavily Played' },
  { value: 'DMG', label: 'Damaged' },
];

const SORT_OPTIONS = [
  { value: 'value_desc', label: 'Highest Value' },
  { value: 'value_asc', label: 'Lowest Value' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'added_desc', label: 'Recently Added' },
  { value: 'rarity', label: 'Rarity' },
];

/* ─── demo data (used when API is not available) ───────────── */

const DEMO_PORTFOLIO = [
  { id: '1', card_id: 'sv4-186', name: 'Charizard ex', set_name: 'Obsidian Flames', set_id: 'sv4', number: '186/197', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv4/186.png', quantity: 1, condition: 'NM', market_price_zar: 4500, market_price_usd: 245 },
  { id: '2', card_id: 'sv3pt5-198', name: 'Umbreon ex', set_name: '151', set_id: 'sv3pt5', number: '198/165', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv3pt5/198.png', quantity: 1, condition: 'NM', market_price_zar: 3200, market_price_usd: 175 },
  { id: '3', card_id: 'sv4-195', name: 'Mew ex', set_name: 'Obsidian Flames', set_id: 'sv4', number: '195/197', rarity: 'Hyper Rare', image_small: 'https://images.pokemontcg.io/sv4/195.png', quantity: 2, condition: 'LP', market_price_zar: 1800, market_price_usd: 98 },
  { id: '4', card_id: 'sv1-254', name: 'Miraidon ex', set_name: 'Scarlet & Violet', set_id: 'sv1', number: '254/198', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv1/254.png', quantity: 1, condition: 'NM', market_price_zar: 2800, market_price_usd: 153 },
  { id: '5', card_id: 'sv2-193', name: 'Gardevoir ex', set_name: 'Paldea Evolved', set_id: 'sv2', number: '193/193', rarity: 'Illustration Rare', image_small: 'https://images.pokemontcg.io/sv2/193.png', quantity: 1, condition: 'NM', market_price_zar: 950, market_price_usd: 52 },
  { id: '6', card_id: 'sv1-198', name: 'Koraidon ex', set_name: 'Scarlet & Violet', set_id: 'sv1', number: '198/198', rarity: 'Rare Ultra', image_small: 'https://images.pokemontcg.io/sv1/198.png', quantity: 3, condition: 'NM', market_price_zar: 420, market_price_usd: 23 },
  { id: '7', card_id: 'sv4-121', name: 'Tyranitar ex', set_name: 'Obsidian Flames', set_id: 'sv4', number: '121/197', rarity: 'Rare Holo EX', image_small: 'https://images.pokemontcg.io/sv4/121.png', quantity: 2, condition: 'MP', market_price_zar: 280, market_price_usd: 15 },
  { id: '8', card_id: 'sv2-100', name: 'Ting-Lu ex', set_name: 'Paldea Evolved', set_id: 'sv2', number: '100/193', rarity: 'Rare Holo EX', image_small: 'https://images.pokemontcg.io/sv2/100.png', quantity: 1, condition: 'NM', market_price_zar: 180, market_price_usd: 10 },
];

const DEMO_HISTORY = [
  { date: 'Jan', value_zar: 8200, value_usd: 448 },
  { date: 'Feb', value_zar: 9100, value_usd: 497 },
  { date: 'Mar', value_zar: 8800, value_usd: 481 },
  { date: 'Apr', value_zar: 10200, value_usd: 557 },
  { date: 'May', value_zar: 11500, value_usd: 628 },
  { date: 'Jun', value_zar: 12800, value_usd: 699 },
  { date: 'Jul', value_zar: 13400, value_usd: 732 },
  { date: 'Aug', value_zar: 14100, value_usd: 770 },
];

const DEMO_SUMMARY = {
  total_zar: 17730,
  total_usd: 968,
  total_cards: 12,
  unique_cards: 8,
  change_24h_pct: 2.4,
  by_set: [
    { set_name: 'Obsidian Flames', set_id: 'sv4', count: 5, value_zar: 6860 },
    { set_name: 'Scarlet & Violet', set_id: 'sv1', count: 4, value_zar: 4060 },
    { set_name: '151', set_id: 'sv3pt5', count: 1, value_zar: 3200 },
    { set_name: 'Paldea Evolved', set_id: 'sv2', count: 2, value_zar: 1130 },
  ],
  by_rarity: [
    { rarity: 'Special Art Rare', count: 3, value_zar: 10500 },
    { rarity: 'Hyper Rare', count: 2, value_zar: 3600 },
    { rarity: 'Illustration Rare', count: 1, value_zar: 950 },
    { rarity: 'Rare Ultra', count: 3, value_zar: 1260 },
    { rarity: 'Rare Holo EX', count: 3, value_zar: 740 },
  ],
};

const DEMO_SEARCH_RESULTS = [
  { card_id: 'sv5-203', name: 'Charizard ex', set_name: 'Temporal Forces', number: '203/162', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv5/203.png', market_price_zar: 5200, market_price_usd: 284 },
  { card_id: 'sv5-162', name: 'Walking Wake ex', set_name: 'Temporal Forces', number: '162/162', rarity: 'Rare Ultra', image_small: 'https://images.pokemontcg.io/sv5/162.png', market_price_zar: 680, market_price_usd: 37 },
  { card_id: 'sv4-197', name: 'Charizard ex', set_name: 'Obsidian Flames', number: '197/197', rarity: 'Hyper Rare', image_small: 'https://images.pokemontcg.io/sv4/197.png', market_price_zar: 3800, market_price_usd: 208 },
  { card_id: 'sv3pt5-181', name: 'Alakazam ex', set_name: '151', number: '181/165', rarity: 'Illustration Rare', image_small: 'https://images.pokemontcg.io/sv3pt5/181.png', market_price_zar: 1250, market_price_usd: 68 },
  { card_id: 'sv2-191', name: 'Chien-Pao ex', set_name: 'Paldea Evolved', number: '191/193', rarity: 'Illustration Rare', image_small: 'https://images.pokemontcg.io/sv2/191.png', market_price_zar: 720, market_price_usd: 39 },
  { card_id: 'sv1-253', name: 'Arcanine ex', set_name: 'Scarlet & Violet', number: '253/198', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv1/253.png', market_price_zar: 1100, market_price_usd: 60 },
];

/* ─── custom chart tooltip ─────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      <p>{formatZAR(payload[0]?.value)}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/*  PORTFOLIO DASHBOARD                                       */
/* ═══════════════════════════════════════════════════════════ */

const PortfolioDashboard = () => {
  const { isAuthenticated, user, getToken } = useCustomerAuth();
  const navigate = useNavigate();

  // ── state ──
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  // card list filters
  const [sortBy, setSortBy] = useState('value_desc');
  const [filterSet, setFilterSet] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingCard, setAddingCard] = useState(null); // card being added
  const [addQuantity, setAddQuantity] = useState(1);
  const [addCondition, setAddCondition] = useState('NM');
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  // inline editing
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── auth guard ──
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/portfolio' } } });
    }
  }, [isAuthenticated, navigate]);

  // ── fetch data ──
  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const [portfolioData, summaryData, historyData] = await Promise.all([
        getPortfolio(token),
        getPortfolioSummary(token),
        getPortfolioHistory(token),
      ]);
      setPortfolio(portfolioData.cards || portfolioData || []);
      setSummary(summaryData);
      setHistory(historyData.history || historyData || []);
      setUsingDemo(false);
    } catch {
      // API not available yet — use demo data
      setPortfolio(DEMO_PORTFOLIO);
      setSummary(DEMO_SUMMARY);
      setHistory(DEMO_HISTORY);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  // ── search ──
  const handleSearch = useCallback(async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const token = getToken();
      const data = await searchCards(token, q);
      setSearchResults(data.cards || data || []);
    } catch {
      // fallback demo search
      const filtered = DEMO_SEARCH_RESULTS.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.set_name.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : DEMO_SEARCH_RESULTS);
    } finally {
      setSearching(false);
    }
  }, [getToken]);

  const onSearchInput = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => handleSearch(q), 350);
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // ── add card ──
  const handleAddCard = async () => {
    if (!addingCard) return;
    try {
      const token = getToken();
      if (!usingDemo) {
        await addToPortfolio(token, {
          card_id: addingCard.card_id,
          quantity: addQuantity,
          condition: addCondition,
        });
      }
      // Optimistic update
      const newEntry = {
        id: `demo-${Date.now()}`,
        ...addingCard,
        quantity: addQuantity,
        condition: addCondition,
      };
      setPortfolio(prev => [newEntry, ...prev]);
      // Update summary totals
      if (summary) {
        setSummary(prev => ({
          ...prev,
          total_zar: (prev.total_zar || 0) + (addingCard.market_price_zar || 0) * addQuantity,
          total_usd: (prev.total_usd || 0) + (addingCard.market_price_usd || 0) * addQuantity,
          total_cards: (prev.total_cards || 0) + addQuantity,
          unique_cards: (prev.unique_cards || 0) + 1,
        }));
      }
      toast.success(`${addingCard.name} added to portfolio`);
      setAddingCard(null);
      setAddQuantity(1);
      setAddCondition('NM');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── update quantity ──
  const handleUpdateQuantity = async (entry, delta) => {
    const newQty = Math.max(1, (entry.quantity || 1) + delta);
    setPortfolio(prev => prev.map(c => c.id === entry.id ? { ...c, quantity: newQty } : c));
    try {
      const token = getToken();
      if (!usingDemo) await updatePortfolioCard(token, entry.id, { quantity: newQty });
    } catch {
      // revert
      setPortfolio(prev => prev.map(c => c.id === entry.id ? { ...c, quantity: entry.quantity } : c));
    }
  };

  // ── delete card ──
  const handleDelete = async (entry) => {
    setPortfolio(prev => prev.filter(c => c.id !== entry.id));
    setDeleteConfirm(null);
    try {
      const token = getToken();
      if (!usingDemo) await removeFromPortfolio(token, entry.id);
      toast.success(`${entry.name} removed`);
    } catch {
      setPortfolio(prev => [...prev, entry]);
      toast.error('Failed to remove card');
    }
  };

  // ── derived data ──
  const totalZAR = summary?.total_zar || portfolio.reduce((s, c) => s + (c.market_price_zar || 0) * (c.quantity || 1), 0);
  const totalUSD = summary?.total_usd || portfolio.reduce((s, c) => s + (c.market_price_usd || 0) * (c.quantity || 1), 0);
  const totalCards = summary?.total_cards || portfolio.reduce((s, c) => s + (c.quantity || 1), 0);
  const uniqueCards = summary?.unique_cards || portfolio.length;
  const changePct = summary?.change_24h_pct || 0;

  const uniqueSets = [...new Set(portfolio.map(c => c.set_name).filter(Boolean))];
  const uniqueRarities = [...new Set(portfolio.map(c => c.rarity).filter(Boolean))];

  const top5 = [...portfolio]
    .sort((a, b) => (b.market_price_zar || 0) * (b.quantity || 1) - (a.market_price_zar || 0) * (a.quantity || 1))
    .slice(0, 5);

  // ── sort & filter cards ──
  const filteredCards = portfolio
    .filter(c => (!filterSet || c.set_name === filterSet))
    .filter(c => (!filterRarity || c.rarity === filterRarity))
    .sort((a, b) => {
      switch (sortBy) {
        case 'value_desc': return (b.market_price_zar || 0) * (b.quantity || 1) - (a.market_price_zar || 0) * (a.quantity || 1);
        case 'value_asc': return (a.market_price_zar || 0) * (a.quantity || 1) - (b.market_price_zar || 0) * (b.quantity || 1);
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        case 'added_desc': return (b.id || '').localeCompare(a.id || '');
        case 'rarity': return (b.market_price_zar || 0) - (a.market_price_zar || 0);
        default: return 0;
      }
    });

  // ── loading state ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Portfolio Tracker</p>
              <h1 className="text-3xl font-bold text-white">My Collection</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/portfolio/completion"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-600 text-gray-300 font-medium rounded-full hover:border-gray-400 hover:text-white transition-colors text-sm"
              >
                <Layers className="w-4 h-4" />
                Set Completion
              </Link>
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-gray-900 font-medium rounded-full hover:bg-[#c9a432] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Demo banner ── */}
        {usingDemo && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Showing demo data — connect your portfolio API to see real values.</span>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="border-l-4 border-[#D4AF37] pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Total Value</p>
            <p className="text-3xl font-bold text-gray-900">{formatZAR(totalZAR)}</p>
            <p className="text-sm text-gray-400 mt-1">{formatUSD(totalUSD)}</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">24h Change</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
              </p>
              {changePct >= 0
                ? <TrendingUp className="w-5 h-5 text-green-500" />
                : <TrendingDown className="w-5 h-5 text-red-500" />
              }
            </div>
            <p className="text-sm text-gray-400 mt-1">market movement</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Total Cards</p>
            <p className="text-3xl font-bold text-gray-900">{totalCards}</p>
            <p className="text-sm text-gray-400 mt-1">{uniqueCards} unique</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Avg. Card Value</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatZAR(uniqueCards > 0 ? totalZAR / uniqueCards : 0)}
            </p>
            <p className="text-sm text-gray-400 mt-1">per unique card</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 max-w-md">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'cards', label: 'My Cards' },
            { key: 'breakdown', label: 'Breakdown' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ OVERVIEW TAB ═══════ */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Value Chart */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio Value Over Time</h2>
              <div className="border border-gray-200 rounded-2xl p-6">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value_zar"
                        stroke="#D4AF37"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                    Not enough data yet
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Cards */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Top Cards</h2>
              <div className="space-y-3">
                {top5.map((card, i) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default"
                  >
                    <span className="text-sm font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                    <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {card.image_small ? (
                        <img src={card.image_small} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{card.name}</p>
                      <p className="text-xs text-gray-400 truncate">{card.set_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatZAR(card.market_price_zar * (card.quantity || 1))}</p>
                      {card.quantity > 1 && (
                        <p className="text-xs text-gray-400">×{card.quantity}</p>
                      )}
                    </div>
                  </div>
                ))}
                {top5.length === 0 && (
                  <div className="py-10 text-center text-sm text-gray-400">
                    Add cards to see your top holdings
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ CARDS TAB ═══════ */}
        {activeTab === 'cards' && (
          <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    showFilters || filterSet || filterRarity
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {(filterSet || filterRarity) && (
                    <span className="bg-white text-gray-900 text-xs px-1.5 rounded-full font-medium">
                      {[filterSet, filterRarity].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-400">
                {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Filter dropdowns */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Set</label>
                  <select
                    value={filterSet}
                    onChange={(e) => setFilterSet(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="">All Sets</option>
                    {uniqueSets.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rarity</label>
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="">All Rarities</option>
                    {uniqueRarities.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {(filterSet || filterRarity) && (
                  <button
                    onClick={() => { setFilterSet(''); setFilterRarity(''); }}
                    className="self-end px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Card Grid */}
            {filteredCards.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">
                  {portfolio.length === 0 ? 'Your portfolio is empty' : 'No cards match your filters'}
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  {portfolio.length === 0
                    ? 'Search and add cards to start tracking your collection.'
                    : 'Try adjusting your filters.'}
                </p>
                {portfolio.length === 0 && (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Card
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-3d hover:border-gray-200"
                  >
                    {/* Card Image */}
                    <div className="relative aspect-3/4 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {card.image_small ? (
                        <img
                          src={card.image_small}
                          alt={card.name}
                          className="w-[85%] h-[85%] object-contain"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-200" />
                      )}
                      {/* Rarity badge */}
                      {card.rarity && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${RARITY_COLORS[card.rarity] || 'bg-gray-100 text-gray-600'}`}>
                          {card.rarity}
                        </span>
                      )}
                      {/* Quantity badge */}
                      {(card.quantity || 1) > 1 && (
                        <span className="absolute top-2 right-2 w-6 h-6 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          ×{card.quantity}
                        </span>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{card.name}</h3>
                      <p className="text-xs text-gray-400 truncate mb-2">{card.set_name} · {card.number}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          {formatZAR(card.market_price_zar * (card.quantity || 1))}
                        </span>
                        <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">
                          {card.condition || 'NM'}
                        </span>
                      </div>

                      {/* Inline controls */}
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleUpdateQuantity(card, -1)}
                          disabled={(card.quantity || 1) <= 1}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{card.quantity || 1}</span>
                        <button
                          onClick={() => handleUpdateQuantity(card, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => setDeleteConfirm(card)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════ BREAKDOWN TAB ═══════ */}
        {activeTab === 'breakdown' && (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* By Set */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Value by Set</h2>
              <div className="space-y-3">
                {(summary?.by_set || []).map((s) => {
                  const pct = totalZAR > 0 ? (s.value_zar / totalZAR) * 100 : 0;
                  return (
                    <div key={s.set_id || s.set_name} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.set_name}</p>
                          <p className="text-xs text-gray-400">{s.count} card{s.count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatZAR(s.value_zar)}</p>
                          <p className="text-xs text-gray-400">{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#D4AF37] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!summary?.by_set || summary.by_set.length === 0) && (
                  <p className="text-sm text-gray-400 py-8 text-center">No set data available</p>
                )}
              </div>
            </div>

            {/* By Rarity */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Value by Rarity</h2>
              <div className="space-y-3">
                {(summary?.by_rarity || []).map((r) => {
                  const pct = totalZAR > 0 ? (r.value_zar / totalZAR) * 100 : 0;
                  return (
                    <div key={r.rarity} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${RARITY_COLORS[r.rarity] || 'bg-gray-100 text-gray-600'}`}>
                            {r.rarity}
                          </span>
                          <span className="text-xs text-gray-400">{r.count} card{r.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatZAR(r.value_zar)}</p>
                          <p className="text-xs text-gray-400">{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!summary?.by_rarity || summary.by_rarity.length === 0) && (
                  <p className="text-sm text-gray-400 py-8 text-center">No rarity data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ SEARCH / ADD MODAL ═══════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setAddingCard(null); }}
          />

          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[75vh] flex flex-col overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={onSearchInput}
                    placeholder="Search cards by name, set, or number..."
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setAddingCard(null); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results or Add form */}
            <div className="flex-1 overflow-y-auto p-4">
              {addingCard ? (
                /* ── Add Card Form ── */
                <div>
                  <button
                    onClick={() => setAddingCard(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
                  >
                    ← Back to results
                  </button>
                  <div className="flex gap-6">
                    <div className="w-32 shrink-0">
                      {addingCard.image_small ? (
                        <img src={addingCard.image_small} alt={addingCard.name} className="w-full rounded-lg" />
                      ) : (
                        <div className="w-full aspect-3/4 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{addingCard.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{addingCard.set_name} · {addingCard.number}</p>
                      {addingCard.rarity && (
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full mb-3 ${RARITY_COLORS[addingCard.rarity] || 'bg-gray-100 text-gray-600'}`}>
                          {addingCard.rarity}
                        </span>
                      )}
                      <p className="text-xl font-bold text-gray-900 mb-4">{formatZAR(addingCard.market_price_zar)}</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quantity</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-lg font-medium text-gray-900">{addQuantity}</span>
                            <button
                              onClick={() => setAddQuantity(addQuantity + 1)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Condition</label>
                          <div className="flex flex-wrap gap-2">
                            {CONDITION_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => setAddCondition(opt.value)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  addCondition === opt.value
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {opt.value}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {CONDITION_OPTIONS.find(o => o.value === addCondition)?.label}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleAddCard}
                        className="mt-6 w-full py-3 bg-[#D4AF37] text-gray-900 font-medium rounded-full hover:bg-[#c9a432] transition-colors text-sm"
                      >
                        Add to Portfolio — {formatZAR(addingCard.market_price_zar * addQuantity)}
                      </button>
                    </div>
                  </div>
                </div>
              ) : searching ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full" />
                </div>
              ) : searchResults.length > 0 ? (
                /* ── Search Results Grid ── */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchResults.map((card) => (
                    <button
                      key={card.card_id}
                      onClick={() => { setAddingCard(card); setAddQuantity(1); setAddCondition('NM'); }}
                      className="group text-left bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <div className="aspect-3/4 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {card.image_small ? (
                          <img src={card.image_small} alt={card.name} className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <Package className="w-8 h-8 text-gray-200" />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-gray-900 truncate">{card.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{card.set_name}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-gray-900">{formatZAR(card.market_price_zar)}</span>
                          <span className="text-[9px] bg-[#D4AF37]/10 text-[#B8941F] px-1.5 py-0.5 rounded-full font-medium">
                            + Add
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  No cards found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DELETE CONFIRMATION ═══════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-6">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Remove Card</h2>
            <p className="text-sm text-gray-600 mb-6">
              Remove <span className="font-medium">{deleteConfirm.name}</span> from your portfolio? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:border-gray-900 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
