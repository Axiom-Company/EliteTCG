import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronRight, ChevronDown, Package, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import SEO from '../../components/SEO/SEO';
import { ELITE_API_URL } from '../../config/api';

const categories = [
  { value: '', label: 'All' },
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


const CardSkeleton = () => (
  <div className="bg-white overflow-hidden animate-pulse">
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
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

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

  const activeSortLabel =
    sortOptions.find(s => s.value === filters.sort)?.label ?? 'Newest First';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        params.set('limit', '100');

        const res = await fetch(`${ELITE_API_URL}/api/products?${params}`);
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

  // Close dropdowns on outside click
  useEffect(() => {
    if (!sortOpen && !catOpen) return;
    const handleClick = () => { setSortOpen(false); setCatOpen(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [sortOpen, catOpen]);


  return (
    <div className="min-h-screen bg-white">
      <SEO title="Shop All Products" description="Browse our full range of Pokemon TCG products including booster boxes, ETBs, singles, and accessories." path="/products" />

      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 ">
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

        {/* ── Top filter bar ── */}
        <div className="mb-6 space-y-3 ">

          {/* Row 1: Search + Sort + Mobile filter button */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm mr-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products…"
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

            {/* Category dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setCatOpen(!catOpen); setSortOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {activeCategoryLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[180px] py-1">
                  {categories.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('category', value); setCatOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        filters.category === value
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
                onClick={(e) => { e.stopPropagation(); setSortOpen(!sortOpen); setCatOpen(false); }}
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
        {!loading && products.length > 0 && (
          <p className="text-xs text-gray-400 mb-4 ">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ">
            {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
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
                className="text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
              {/* Categories */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2 px-1">Category</p>
                <div className="space-y-0.5">
                  {categories.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { updateFilter('category', value); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        filters.category === value
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

export default Products;
