import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronRight, ChevronDown, Package, SlidersHorizontal } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

/* ─── Pack art images ─── */
import sv9Pack from '../../assets/packs/Journey-Together-Pack.png';
import sv8pt5Pack from '../../assets/packs/prismatic-evolution.png';
import sv8Pack from '../../assets/packs/surging-sparks.png';
import sv4pt5Pack from '../../assets/packs/PaldeanFates.png';
import sv3pt5Pack from '../../assets/packs/151(Pokemon).png';
import sv2Pack from '../../assets/packs/Paldea-Evolved.png';
import swsh8Pack from '../../assets/packs/fusion-strike.png';
import swsh7Pack from '../../assets/packs/evolving-skies.png';
import swsh6Pack from '../../assets/packs/Chilling-Reign.png';
import sv10Pack from '../../assets/packs/destinedrivals.png';
import sv10pt5bPack from '../../assets/packs/black-bolt.png';
import sv10pt5wPack from '../../assets/packs/white-flare.png';
import me01Pack from '../../assets/packs/mega-evolution.png';
import me02Pack from '../../assets/packs/phantasmal-flames.png';
import me02pt5Pack from '../../assets/packs/ascended-heroes.png';

const PACK_SETS = [
  { id: 'me02pt5', name: 'Ascended Heroes',      series: 'Mega Evolution',   total: 295, releaseDate: '2026/01/30', img: me02pt5Pack, price: 29.99 },
  { id: 'me02',    name: 'Phantasmal Flames',     series: 'Mega Evolution',   total: 130, releaseDate: '2025/11/14', img: me02Pack,    price: 29.99 },
  { id: 'me01',    name: 'Mega Evolution',        series: 'Mega Evolution',   total: 188, releaseDate: '2025/09/26', img: me01Pack,    price: 29.99 },
  { id: 'sv10pt5b', name: 'Black Bolt',           series: 'Scarlet & Violet', total: 172, releaseDate: '2025/07/17', img: sv10pt5bPack, price: 29.99 },
  { id: 'sv10pt5w', name: 'White Flare',          series: 'Scarlet & Violet', total: 173, releaseDate: '2025/07/17', img: sv10pt5wPack, price: 29.99 },
  { id: 'sv10',    name: 'Destined Rivals',       series: 'Scarlet & Violet', total: 244, releaseDate: '2025/05/30', img: sv10Pack,    price: 24.99 },
  { id: 'sv9',     name: 'Journey Together',      series: 'Scarlet & Violet', total: 167, releaseDate: '2025/03/28', img: sv9Pack,     price: 24.99 },
  { id: 'sv8pt5',  name: 'Prismatic Evolutions',  series: 'Scarlet & Violet', total: 175, releaseDate: '2025/01/17', img: sv8pt5Pack,  price: 29.99 },
  { id: 'sv8',     name: 'Surging Sparks',        series: 'Scarlet & Violet', total: 191, releaseDate: '2024/11/08', img: sv8Pack,     price: 24.99 },
  { id: 'sv4pt5',  name: 'Paldean Fates',         series: 'Scarlet & Violet', total: 245, releaseDate: '2024/01/26', img: sv4pt5Pack,  price: 29.99 },
  { id: 'sv3pt5',  name: '151',                   series: 'Scarlet & Violet', total: 207, releaseDate: '2023/09/22', img: sv3pt5Pack,  price: 34.99 },
  { id: 'sv2',     name: 'Paldea Evolved',        series: 'Scarlet & Violet', total: 193, releaseDate: '2023/06/09', img: sv2Pack,     price: 24.99 },
  { id: 'swsh8',   name: 'Fusion Strike',         series: 'Sword & Shield',   total: 264, releaseDate: '2021/11/12', img: swsh8Pack,   price: 29.99 },
  { id: 'swsh7',   name: 'Evolving Skies',        series: 'Sword & Shield',   total: 203, releaseDate: '2021/08/27', img: swsh7Pack,   price: 39.99 },
  { id: 'swsh6',   name: 'Chilling Reign',        series: 'Sword & Shield',   total: 198, releaseDate: '2021/06/18', img: swsh6Pack,   price: 29.99 },
];

const seriesOptions = [
  { value: '', label: 'All Series' },
  { value: 'Mega Evolution', label: 'Mega Evolution' },
  { value: 'Scarlet & Violet', label: 'Scarlet & Violet' },
  { value: 'Sword & Shield', label: 'Sword & Shield' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

const EliteRips = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  const filters = {
    series: searchParams.get('series') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});
  const hasActiveFilters = filters.series || filters.search;

  const activeSeriesLabel =
    seriesOptions.find(s => s.value === filters.series)?.label ?? 'All Series';
  const activeSortLabel =
    sortOptions.find(s => s.value === filters.sort)?.label ?? 'Newest First';

  // Filter & sort
  let sets = PACK_SETS;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    sets = sets.filter(s => s.name.toLowerCase().includes(q) || s.series.toLowerCase().includes(q));
  }
  if (filters.series) {
    sets = sets.filter(s => s.series === filters.series);
  }
  switch (filters.sort) {
    case 'oldest':
      sets = [...sets].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
      break;
    case 'price_low':
      sets = [...sets].sort((a, b) => a.price - b.price);
      break;
    case 'price_high':
      sets = [...sets].sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sets = [...sets].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  // Close dropdowns on outside click
  useEffect(() => {
    if (!sortOpen && !seriesOpen) return;
    const handleClick = () => { setSortOpen(false); setSeriesOpen(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [sortOpen, seriesOpen]);

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Elite Rips" description="Open mystery packs and discover rare Pokemon cards." path="/elite-rips" />

      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {filters.series ? (
            <>
              <Link to="/elite-rips" className="hover:text-gray-700 transition-colors">Elite Rips</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">{activeSeriesLabel}</span>
            </>
          ) : (
            <span className="text-gray-600">Elite Rips</span>
          )}
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Elite Rips</h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Open digital Pokémon TCG booster packs with provably fair randomness.
            Every outcome is cryptographically verifiable — you can independently confirm
            that no result was manipulated.
            All pull rates, algorithms, and source code are publicly documented in our{' '}
            <Link to="/elite-rips-policy" className="text-primary hover:text-primary-dark underline transition-colors">
              Elite Rips Policy
            </Link>.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm mr-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search packs…"
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Series dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setSeriesOpen(!seriesOpen); setSortOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {activeSeriesLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {seriesOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[180px] py-1">
                  {seriesOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('series', value); setSeriesOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        filters.series === value
                          ? 'text-gray-900 font-medium bg-gray-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setSortOpen(!sortOpen); setSeriesOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {activeSortLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[180px] py-1">
                  {sortOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('sort', value); setSortOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        filters.sort === value
                          ? 'text-gray-900 font-medium bg-gray-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex sm:hidden items-center justify-center w-10 h-10 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        {sets.length > 0 && (
          <p className="text-xs text-gray-400 mb-4">{sets.length} pack{sets.length !== 1 ? 's' : ''}</p>
        )}

        {/* Pack Grid */}
        {sets.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">No packs found</p>
            <p className="text-sm text-gray-400 mb-5">
              {filters.search
                ? `No packs matching "${filters.search}"`
                : 'Try a different filter or check back soon.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sets.map((set) => (
              <Link
                key={set.id}
                to={`/elite-rips/${set.id}`}
                className="group flex flex-col bg-white overflow-hidden"
              >
                <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src={set.img}
                    alt={set.name}
                    style={{ width: '60%', height: '60%' }}
                    className="object-contain"
                  />
                </div>
                <div className="p-2 md:p-5 flex flex-col gap-1">
                  <p className="text-[11px] text-gray-400">{set.series}</p>
                  <h3 className="text-sm text-gray-900 line-clamp-2 leading-snug">{set.name}</h3>
                  <p className="text-[11px] text-gray-400">{set.total} cards</p>
                  <span className="text-lg font-medium text-gray-900 mt-1">R{set.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 sm:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 sm:hidden max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Filters</p>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Series */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">Series</p>
                <div className="space-y-0.5">
                  {seriesOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('series', value); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        filters.series === value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100" />
              {/* Sort */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">Sort By</p>
                <div className="space-y-0.5">
                  {sortOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('sort', value); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        filters.sort === value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors px-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EliteRips;
