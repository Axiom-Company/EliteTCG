import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const conditions = [
  { value: '', label: 'All Conditions' },
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'played', label: 'Played' },
  { value: 'poor', label: 'Poor' }
];

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'singles', label: 'Singles' },
  { value: 'sealed', label: 'Sealed Products' },
  { value: 'accessories', label: 'Accessories' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
];

const conditionLabels = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor'
};

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
    page: parseInt(searchParams.get('page') || '1')
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

  const hasActiveFilters = filters.search || filters.condition || filters.category || filters.min_price || filters.max_price;

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
      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.condition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  filters.condition
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {conditions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  filters.category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <span className="text-sm text-gray-500">R</span>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  placeholder="Min"
                  className="w-16 bg-transparent text-sm focus:outline-none"
                />
                <span className="text-gray-300">–</span>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  placeholder="Max"
                  className="w-16 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {pagination.total} listing{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">No listings found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or check back later.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-gray-900 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="group"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-3">
                  {listing.images?.[0] ? (
                    <img
                      src={getImageUrl(listing.images[0])}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {listing.compare_at_price && listing.compare_at_price > listing.price && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#FFCB32] rounded-full text-xs font-medium text-gray-900">
                      -{Math.round((1 - listing.price / listing.compare_at_price) * 100)}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                    {listing.title}
                  </h3>

                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conditionLabels[listing.condition]}
                    {listing.seller?.display_name && ` · ${listing.seller.display_name}`}
                  </p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      R{listing.price?.toLocaleString()}
                    </span>
                    {listing.compare_at_price && listing.compare_at_price > listing.price && (
                      <span className="text-sm text-gray-400 line-through">
                        R{listing.compare_at_price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
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
  );
};

export default MarketplaceBrowse;
