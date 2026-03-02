import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { getSetCompletion, getSetGaps } from '../../services/portfolioApi';
import {
  ChevronLeft, ChevronDown, ChevronUp, Package, ExternalLink,
  CheckCircle2, Circle, Search, X,
} from 'lucide-react';
import SEO from '../../components/SEO/SEO';

/* ─── helpers ──────────────────────────────────────────────── */

const formatZAR = (v) => `R${Number(v || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pctColor = (pct) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-[#D4AF37]';
  if (pct >= 25) return 'bg-amber-400';
  return 'bg-gray-300';
};

const pctTextColor = (pct) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 50) return 'text-[#B8941F]';
  return 'text-gray-500';
};

/* ─── demo data ────────────────────────────────────────────── */

const DEMO_COMPLETION = [
  { set_id: 'sv4', set_name: 'Obsidian Flames', total_cards: 197, owned_cards: 42, completion_pct: 21.3, set_logo: null },
  { set_id: 'sv3pt5', set_name: '151', total_cards: 165, owned_cards: 89, completion_pct: 53.9, set_logo: null },
  { set_id: 'sv1', set_name: 'Scarlet & Violet', total_cards: 198, owned_cards: 164, completion_pct: 82.8, set_logo: null },
  { set_id: 'sv2', set_name: 'Paldea Evolved', total_cards: 193, owned_cards: 67, completion_pct: 34.7, set_logo: null },
  { set_id: 'sv5', set_name: 'Temporal Forces', total_cards: 162, owned_cards: 12, completion_pct: 7.4, set_logo: null },
  { set_id: 'sv3', set_name: 'Obsidian Flames', total_cards: 230, owned_cards: 145, completion_pct: 63.0, set_logo: null },
];

const DEMO_GAPS = {
  sv4: [
    { card_id: 'sv4-186', name: 'Charizard ex', number: '186/197', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv4/186.png', market_price_zar: 4500, available_on_marketplace: true },
    { card_id: 'sv4-195', name: 'Mew ex', number: '195/197', rarity: 'Hyper Rare', image_small: 'https://images.pokemontcg.io/sv4/195.png', market_price_zar: 1800, available_on_marketplace: true },
    { card_id: 'sv4-121', name: 'Tyranitar ex', number: '121/197', rarity: 'Rare Holo EX', image_small: 'https://images.pokemontcg.io/sv4/121.png', market_price_zar: 280, available_on_marketplace: false },
    { card_id: 'sv4-45', name: 'Armarouge', number: '045/197', rarity: 'Uncommon', image_small: 'https://images.pokemontcg.io/sv4/45.png', market_price_zar: 15, available_on_marketplace: true },
    { card_id: 'sv4-88', name: 'Grumpig', number: '088/197', rarity: 'Common', image_small: 'https://images.pokemontcg.io/sv4/88.png', market_price_zar: 5, available_on_marketplace: false },
  ],
  sv3pt5: [
    { card_id: 'sv3pt5-198', name: 'Umbreon ex', number: '198/165', rarity: 'Special Art Rare', image_small: 'https://images.pokemontcg.io/sv3pt5/198.png', market_price_zar: 3200, available_on_marketplace: true },
    { card_id: 'sv3pt5-181', name: 'Alakazam ex', number: '181/165', rarity: 'Illustration Rare', image_small: 'https://images.pokemontcg.io/sv3pt5/181.png', market_price_zar: 1250, available_on_marketplace: false },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  SET COMPLETION PAGE                                       */
/* ═══════════════════════════════════════════════════════════ */

const SetCompletion = () => {
  const { isAuthenticated, getToken } = useCustomerAuth();
  const navigate = useNavigate();

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  // expanded set for gap analysis
  const [expandedSet, setExpandedSet] = useState(null);
  const [gaps, setGaps] = useState({});
  const [gapsLoading, setGapsLoading] = useState(null);

  // search filter
  const [setSearch, setSetSearch] = useState('');

  // ── auth guard ──
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/portfolio/completion' } } });
    }
  }, [isAuthenticated, navigate]);

  // ── fetch completion ──
  useEffect(() => {
    const fetchCompletion = async () => {
      const token = getToken();
      if (!token) return;
      setLoading(true);
      try {
        const data = await getSetCompletion(token);
        setSets(data.sets || data || []);
        setUsingDemo(false);
      } catch {
        setSets(DEMO_COMPLETION);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchCompletion();
  }, [isAuthenticated, getToken]);

  // ── fetch gaps for a set ──
  const loadGaps = useCallback(async (setId) => {
    if (gaps[setId]) return; // already loaded
    setGapsLoading(setId);
    try {
      const token = getToken();
      const data = await getSetGaps(token, setId);
      setGaps(prev => ({ ...prev, [setId]: data.missing || data || [] }));
    } catch {
      // demo fallback
      setGaps(prev => ({ ...prev, [setId]: DEMO_GAPS[setId] || [] }));
    } finally {
      setGapsLoading(null);
    }
  }, [getToken, gaps]);

  const toggleSet = (setId) => {
    if (expandedSet === setId) {
      setExpandedSet(null);
    } else {
      setExpandedSet(setId);
      loadGaps(setId);
    }
  };

  const filteredSets = sets.filter(s =>
    !setSearch || s.set_name.toLowerCase().includes(setSearch.toLowerCase())
  );

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
      <SEO title="Set Completion" noindex />
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="text-3xl font-bold text-white">Set Completion</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your progress toward completing each set.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Demo banner ── */}
        {usingDemo && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-2">
            <Package className="w-4 h-4 shrink-0" />
            <span>Showing demo data — connect your portfolio API to see real completion stats.</span>
          </div>
        )}

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10">
          <div className="border-l-4 border-[#D4AF37] pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Sets Tracked</p>
            <p className="text-3xl font-bold text-gray-900">{sets.length}</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Completed Sets</p>
            <p className="text-3xl font-bold text-green-600">
              {sets.filter(s => s.completion_pct >= 100).length}
            </p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Average Completion</p>
            <p className="text-3xl font-bold text-gray-900">
              {sets.length > 0
                ? (sets.reduce((s, c) => s + c.completion_pct, 0) / sets.length).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 mb-6 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={setSearch}
            onChange={(e) => setSetSearch(e.target.value)}
            placeholder="Search sets..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          {setSearch && (
            <button onClick={() => setSetSearch('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Set List ── */}
        <div className="space-y-3">
          {filteredSets.map((set) => {
            const isExpanded = expandedSet === set.set_id;
            const setGaps = gaps[set.set_id] || [];

            return (
              <div key={set.set_id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors">
                {/* Set Row */}
                <button
                  onClick={() => toggleSet(set.set_id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Set icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    {set.completion_pct >= 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{set.set_name}</h3>
                      {set.completion_pct >= 100 && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 rounded-full">Complete</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${pctColor(set.completion_pct)}`}
                            style={{ width: `${Math.min(set.completion_pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${pctTextColor(set.completion_pct)}`}>
                        {set.completion_pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {set.owned_cards}/{set.total_cards}
                    </p>
                    <p className="text-xs text-gray-400">cards</p>
                  </div>

                  {/* Chevron */}
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  }
                </button>

                {/* Gap Analysis (expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    {gapsLoading === set.set_id ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full" />
                      </div>
                    ) : setGaps.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-400">
                        {set.completion_pct >= 100
                          ? 'Congratulations! You have every card in this set.'
                          : 'No gap data available for this set.'}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Missing Cards ({setGaps.length})
                          </h4>
                          <p className="text-xs text-gray-400">
                            Est. cost to complete: {formatZAR(setGaps.reduce((s, c) => s + (c.market_price_zar || 0), 0))}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {setGaps.map((card) => (
                            <div
                              key={card.card_id}
                              className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
                            >
                              <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                {card.image_small ? (
                                  <img src={card.image_small} alt={card.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{card.name}</p>
                                <p className="text-[10px] text-gray-400">{card.number} · {card.rarity}</p>
                                <p className="text-xs font-bold text-gray-700 mt-0.5">{formatZAR(card.market_price_zar)}</p>
                              </div>
                              {card.available_on_marketplace ? (
                                <Link
                                  to={`/marketplace?q=${encodeURIComponent(card.name)}`}
                                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium bg-[#D4AF37]/10 text-[#B8941F] rounded-full hover:bg-[#D4AF37]/20 transition-colors"
                                >
                                  Buy
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="shrink-0 px-2.5 py-1.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSets.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">
                {sets.length === 0 ? 'No sets to track' : 'No sets match your search'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {sets.length === 0
                  ? 'Add cards to your portfolio to start tracking set completion.'
                  : 'Try a different search term.'}
              </p>
              {sets.length === 0 && (
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Go to Portfolio
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetCompletion;
