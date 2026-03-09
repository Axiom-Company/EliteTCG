import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Package, ArrowLeft, Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import SEO from '../../components/SEO/SEO';

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

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-50" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-gray-100 rounded w-4/5" />
      <div className="h-6 bg-gray-100 rounded w-2/5 mt-2" />
    </div>
  </div>
);

const CategoryDetail = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, productsRes] = await Promise.all([
          fetch(`${ELITE_API_URL}/api/categories/${slug}`),
          fetch(`${ELITE_API_URL}/api/products?category=${slug}&limit=100`),
        ]);
        const catData = await catRes.json();
        const productsData = await productsRes.json();
        setCategory(catData.category || null);
        setProducts(productsData.products || []);
      } catch (err) {
        console.error('Failed to fetch category data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sort) {
      case 'price_low':  return (a.price || 0) - (b.price || 0);
      case 'price_high': return (b.price || 0) - (a.price || 0);
      case 'name':       return (a.name || '').localeCompare(b.name || '');
      default:           return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const formatPrice = (product) => {
    const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.price || 0).toLocaleString()}`;
  };

  const formatComparePrice = (product) => {
    if (!product.compare_at_price) return null;
    const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.compare_at_price).toLocaleString()}`;
  };

  const getDiscountPct = (product) => {
    if (!product.compare_at_price || !product.price) return null;
    const pct = Math.round((1 - product.price / product.compare_at_price) * 100);
    return pct > 0 ? pct : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
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

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-base font-medium text-gray-900 mb-1">Category not found</p>
          <p className="text-sm text-gray-400 mb-5">This category doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {category && <SEO title={category.name} description={category.description || `Shop ${category.name} Pokemon TCG products at EliteTCG.`} path={`/categories/${slug}`} />}
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{category.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Header */}
        <div className="flex items-center gap-6 mb-8">
          {getImageUrl(category.image) && (
            <div className="w-20 h-20 flex-none rounded-2xl bg-white flex items-center justify-center overflow-hidden p-2">
              <img src={getImageUrl(category.image)} alt={category.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">{category.name}</h1>
            {category.description && (
              <p className="text-sm text-gray-400">{category.description}</p>
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
            <p className="text-base font-medium text-gray-900 mb-1">No products in this category yet</p>
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
            {sortedProducts.map((product) => {
              const comparePrice = formatComparePrice(product);
              const discountPct = getDiscountPct(product);
              const wishlisted = isWishlisted(product.id);
              const isComingSoon = product.badge === 'preorder';
              const isOutOfStock = product.inventory?.quantity === 0 && !isComingSoon;
              const isLowStock =
                product.inventory?.quantity > 0 &&
                product.inventory?.quantity <= (product.inventory?.low_stock_threshold ?? 5);

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug || product.id}`}
                  className="group flex flex-col bg-white overflow-hidden transition-all duration-200"
                >
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

                    {!isComingSoon && product.badge && product.badge !== 'none' && (
                      <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full capitalize tracking-wide ${getBadgeStyle(product.badge)}`}>
                        {product.badge}
                      </span>
                    )}

                    {discountPct && !isOutOfStock && !isComingSoon && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#E3350D] text-white">
                        -{discountPct}%
                      </span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-4">
                        <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                          Out of stock
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all ${
                        wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-medium text-gray-900">{formatPrice(product)}</span>
                      {comparePrice && (
                        <span className="text-xs text-gray-400 line-through">{comparePrice}</span>
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
  );
};

export default CategoryDetail;
