import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronRight, Package, SlidersHorizontal } from 'lucide-react';
import ListingCard from '../../components/marketplace/ListingCard';
import { ELITE_API_URL } from '@/config/api';
import SEO from '../../components/SEO/SEO';

const API_BASE_URL = ELITE_API_URL;

const conditions = [
  { value: '', label: 'All Conditions' },
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'played', label: 'Played' },
  { value: 'poor', label: 'Poor' },
];

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'singles', label: 'Singles' },
  { value: 'sealed', label: 'Sealed Products' },
  { value: 'accessories', label: 'Accessories' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-50" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-4/5" />
      <div className="h-4 bg-gray-100 rounded w-3/5" />
      <div className="h-6 bg-gray-100 rounded w-2/5 mt-2" />
    </div>
  </div>
);

const MarketplaceBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const filters = {
    search: searchParams.get('search') || '',
    condition: searchParams.get('condition') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({ sort: 'newest' });
  };

  const hasActiveFilters =
    filters.search || filters.condition || filters.category || filters.min_price || filters.max_price;

  const activeConditionLabel =
    conditions.find((c) => c.value === filters.condition)?.label ?? 'All Conditions';

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.condition) params.set('condition', filters.condition);
        if (filters.category) params.set('category', filters.category);
        if (filters.min_price) params.set('min_price', filters.min_price);
        if (filters.max_price) params.set('max_price', filters.max_price);
        params.set('sort', filters.sort);
        params.set('page', filters.page.toString());
        params.set('limit', '20');

        const res = await fetch(`${API_BASE_URL}/api/marketplace/listings?${params}`);
        const data = await res.json();

        if (res.ok) {
          setListings(data.listings || []);
          setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Marketplace" description="Buy and sell Pokemon TCG cards on the EliteTCG marketplace. Find singles, sealed products, and accessories from verified sellers." path="/marketplace" />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600">Marketplace</span>
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Marketplace</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? '\u2014' : `${pagination.total} listing${pagination.total !== 1 ? 's' : ''}`}
              </p>
            </div>
            {/* Mobile filter hint */}
            <div className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6 w-60 shrink-0 sticky top-22 self-start">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search listings\u2026"
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
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

            {/* Conditions */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
                Condition
              </p>
              <nav className="space-y-0.5">
                {conditions.map(({ value, label }) => {
                  const isActive = filters.condition === value;
                  return (
                    <button
                      key={value}
                      onClick={() => updateFilter('condition', value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-gray-900 text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-gray-100" />

            {/* Categories */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
                Categories
              </p>
              <nav className="space-y-0.5">
                {categories.map(({ value, label }) => {
                  const isActive = filters.category === value;
                  return (
                    <button
                      key={value}
                      onClick={() => updateFilter('category', value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-gray-900 text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-gray-100" />

            {/* Sort */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
                Sort By
              </p>
              <div className="space-y-0.5">
                {sortOptions.map(({ value, label }) => {
                  const isActive = filters.sort === value;
                  return (
                    <button
                      key={value}
                      onClick={() => updateFilter('sort', value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 flex items-center gap-2 ${
                        isActive
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-500 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                      <span className={isActive ? '' : 'ml-3.5'}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Price Range */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
                Price Range
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R</span>
                  <input
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    placeholder="Min"
                    className="w-full pl-7 pr-2 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
                <span className="text-gray-300 text-sm">&ndash;</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R</span>
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    placeholder="Max"
                    className="w-full pl-7 pr-2 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <>
                <div className="border-t border-gray-100" />
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors px-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              </>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Mobile: search + category pills */}
            <div className="lg:hidden mb-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search listings\u2026"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
                {categories.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateFilter('category', value)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      filters.category === value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">Nothing here yet</p>
                <p className="text-sm text-gray-400 mb-5">
                  {filters.search
                    ? `No listings matching "${filters.search}"`
                    : 'Try a different filter or check back soon.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => updateFilter('page', (filters.page - 1).toString())}
                  disabled={filters.page <= 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum.toString())}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          filters.page === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => updateFilter('page', (filters.page + 1).toString())}
                  disabled={filters.page >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceBrowse;
