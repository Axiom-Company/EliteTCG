import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Heart, X, ChevronRight, Package, SlidersHorizontal } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const categories = [
  { value: '', label: 'All Products' },
  { value: 'booster_box', label: 'Booster Boxes' },
  { value: 'etb', label: 'Elite Trainer Boxes' },
  { value: 'singles', label: 'Singles' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'sealed', label: 'Sealed Products' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

const getBadgeStyle = (badge) => {
  switch (badge?.toLowerCase()) {
    case 'hot':      return 'bg-[#E3350D] text-white';
    case 'sale':     return 'bg-[#E3350D] text-white';
    case 'new':      return 'bg-[#FFCB32] text-gray-900';
    case 'limited':  return 'bg-gray-900 text-white';
    case 'preorder': return 'bg-blue-600 text-white';
    default:         return '';
  }
};

const CategoryLabel = ({ value }) => {
  const cat = categories.find(c => c.value === value);
  if (!cat || !value) return null;
  return (
    <span className="text-[10px] text-gray-400 uppercase tracking-widest">
      {cat.label}
    </span>
  );
};

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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickAdd = async (product, e) => {
    e.preventDefault();
    if (product.inventory?.quantity === 0) return;
    setAddingToCart(product.id);
    await new Promise(r => setTimeout(r, 600));
    setAddingToCart(null);
  };

  const filters = {
    category: searchParams.get('category') || '',
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

  const hasActiveFilters = filters.category || filters.search;

  const activeCategoryLabel =
    categories.find(c => c.value === filters.category)?.label ?? 'All Products';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        params.set('limit', '100');

        const res = await fetch(`${API_BASE_URL}/api/products?${params}`);
        const data = await res.json();

        let sorted = data.products || [];

        if (filters.search) {
          const q = filters.search.toLowerCase();
          sorted = sorted.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          );
        }

        switch (filters.sort) {
          case 'price_low':
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price_high':
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'name':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
          default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setProducts(sorted);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const formatPrice = (product) => {
    const symbol =
      product.currency === 'USD' ? '$' :
      product.currency === 'EUR' ? '€' :
      product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.price || 0).toLocaleString()}`;
  };

  const formatComparePrice = (product) => {
    if (!product.compare_at_price) return null;
    const symbol =
      product.currency === 'USD' ? '$' :
      product.currency === 'EUR' ? '€' :
      product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.compare_at_price).toLocaleString()}`;
  };

  const getDiscountPct = (product) => {
    if (!product.compare_at_price || !product.price) return null;
    const pct = Math.round((1 - product.price / product.compare_at_price) * 100);
    return pct > 0 ? pct : null;
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400">
              <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              {filters.category && (
                <>
                  <Link to="/products" className="hover:text-gray-700 transition-colors">All Products</Link>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className="text-gray-600">{activeCategoryLabel}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-6 w-60 shrink-0 sticky top-22 self-start">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3350D]/20 focus:border-[#E3350D]/40 transition-all"
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

            {/* Categories */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">
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
                          ? 'bg-gray-100 text-gray-900 font-medium'
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
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">
                Sort By
              </p>
              <div className="space-y-0.5">
                {sortOptions.map(({ value, label }) => {
                  const isActive = filters.sort === value;
                  return (
                    <button
                      key={value}
                      onClick={() => updateFilter('sort', value)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
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

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile: search + category pills */}
            <div className="lg:hidden mb-5 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Search products…"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3350D]/20 focus:border-[#E3350D]/40"
                  />
                </div>
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
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

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">Nothing here yet</p>
                <p className="text-sm text-gray-400 mb-5">
                  {filters.search
                    ? `No products matching "${filters.search}"`
                    : 'Try a different category or check back soon.'}
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
                {products.map((product) => {
                  const comparePrice = formatComparePrice(product);
                  const discountPct = getDiscountPct(product);
                  const isWishlisted = wishlist.includes(product.id);
                  const isOutOfStock = product.inventory?.quantity === 0;
                  const isLowStock =
                    product.inventory?.quantity > 0 &&
                    product.inventory?.quantity <= (product.inventory?.low_stock_threshold ?? 5);
                  const isAdding = addingToCart === product.id;

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug || product.id}`}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
                        {product.images?.[0] ? (
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            className="w-[75%] h-[75%] object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-200" />
                        )}

                        {/* Badge */}
                        {product.badge && product.badge !== 'none' && (
                          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full capitalize tracking-wide ${getBadgeStyle(product.badge)}`}>
                            {product.badge}
                          </span>
                        )}

                        {/* Discount % */}
                        {discountPct && !isOutOfStock && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#E3350D] text-white">
                            -{discountPct}%
                          </span>
                        )}

                        {/* Out of stock overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-4">
                            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                              Out of stock
                            </span>
                          </div>
                        )}

                        {/* Quick Add — slides up on hover */}
                        {!isOutOfStock && (
                          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                            <button
                              onClick={(e) => handleQuickAdd(product, e)}
                              className="w-full py-2.5 bg-gray-200 hover:bg-gray-800 text-gray-800 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors duration-150"
                            >
                              {isAdding ? (
                                <span className="flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                  </svg>
                                  Adding…
                                </span>
                              ) : (
                                'Quick Add'
                              )}
                            </button>
                          </div>
                        )}

                        {/* Wishlist */}
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className={`absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all ${
                            isWishlisted
                              ? 'text-red-500'
                              : 'text-gray-300 hover:text-gray-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex flex-col gap-1">
                        <CategoryLabel value={product.category} />

                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5">
                          {product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-medium text-gray-900">
                            {formatPrice(product)}
                          </span>
                          {comparePrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {comparePrice}
                            </span>
                          )}
                        </div>

                        {isLowStock && (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                            Only {product.inventory.quantity} left
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Filters</p>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3350D]/20 focus:border-[#E3350D]/40 transition-all"
                />
                {filters.search && (
                  <button onClick={() => updateFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Categories */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">Categories</p>
                <nav className="space-y-0.5">
                  {categories.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('category', value); setMobileFilterOpen(false); }}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${
                        filters.category === value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
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

export default Products;
