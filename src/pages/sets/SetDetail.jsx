import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Package, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { ELITE_API_URL, getImageUrl } from '../../config/api';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];


const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-50" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-gray-100 rounded w-4/5" />
      <div className="h-6 bg-gray-100 rounded w-2/5 mt-2" />
    </div>
  </div>
);

const SetDetail = () => {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [setRes, productsRes] = await Promise.all([
          fetch(`${ELITE_API_URL}/api/sets/${id}`),
          fetch(`${ELITE_API_URL}/api/products?set_id=${id}&limit=100`),
        ]);
        const setData = await setRes.json();
        const productsData = await productsRes.json();
        setSet(setData.set || null);
        setProducts(productsData.products || []);
      } catch (err) {
        console.error('Failed to fetch set data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sort) {
      case 'price_low':  return (a.price || 0) - (b.price || 0);
      case 'price_high': return (b.price || 0) - (a.price || 0);
      case 'name':       return (a.name || '').localeCompare(b.name || '');
      default:           return new Date(b.created_at) - new Date(a.created_at);
    }
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
          <nav className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/sets" className="hover:text-gray-700 transition-colors">All Sets</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Loading...</span>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6 mb-8 animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-none" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-100 rounded w-48" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
          <nav className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/sets" className="hover:text-gray-700 transition-colors">All Sets</Link>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-base font-medium text-gray-900 mb-1">Set not found</p>
          <p className="text-sm text-gray-400 mb-5">This set doesn't exist or has been removed.</p>
          <Link
            to="/sets"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Sets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-[13px] text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/sets" className="hover:text-gray-700 transition-colors">All Sets</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{set.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Set Header */}
        <div className="flex items-center gap-6 mb-8">
          {getImageUrl(set.logo_url) && (
            <div className="w-20 h-20 flex-none rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden p-2">
              <img src={getImageUrl(set.logo_url)} alt={set.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-medium text-gray-900">{set.name}</h1>
              {set.is_new && (
                <span className="px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-primary text-white">New</span>
              )}
            </div>
            {set.release_date && (
              <p className="text-sm text-gray-400">
                Released {new Date(set.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Sort bar */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{products.length} products</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">No products in this set yet</p>
            <p className="text-sm text-gray-400 mb-5">Check back soon or browse all products.</p>
            <Link
              to="/products"
              className="text-sm font-medium text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors inline-flex"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetDetail;
