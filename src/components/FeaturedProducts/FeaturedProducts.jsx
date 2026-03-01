import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const FeaturedProducts = () => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${ELITE_API_URL}/api/products?limit=8`);
        const data = await response.json();
        // Sort: featured products first, then by created_at
        const sorted = (data.products || []).sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
        setProducts(sorted);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const getBadgeClass = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'hot':
      case 'sale': return 'bg-gray-800 text-white';
      case 'new': return 'bg-primary text-white';
      case 'limited': return 'bg-gray-700 text-white';
      default: return '';
    }
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'ZAR': return 'R';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return 'R';
    }
  };

  const formatPrice = (product) => {
    const symbol = getCurrencySymbol(product.currency);
    return `${symbol}${Number(product.price).toFixed(2)}`;
  };

  const formatComparePrice = (product) => {
    if (!product.compare_at_price) return null;
    const symbol = getCurrencySymbol(product.currency);
    return `${symbol}${Number(product.compare_at_price).toFixed(2)}`;
  };

  return (
    <section id="products" className="py-16 bg-white md:py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">Featured Products</h2>
          <p className="text-sm text-gray-500">Hand-picked favorites from our collection</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">No products available</div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-4 md:grid-cols-3 md:gap-4 max-[480px]:grid-cols-1">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug || product.id}`}
                className="card-3d flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 group cursor-pointer"
              >
                <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="max-w-[80%] max-h-[80%] object-contain"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />

                  {product.badge && product.badge !== 'none' && (
                    <span className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full capitalize ${getBadgeClass(product.badge)}`}>
                      {product.badge}
                    </span>
                  )}

                  <button
                    className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full transition-all duration-150 cursor-pointer ${
                      wishlist.includes(product.id) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                    aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <HeartIcon filled={wishlist.includes(product.id)} />
                  </button>
                </div>

                <div className="p-3 flex flex-col items-center text-center">
                  {(product.rating > 0 || product.review_count > 0) && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-gold text-xs">★</span>
                      <span className="text-xs font-medium text-gray-700">{product.rating || 0}</span>
                      <span className="text-xs text-gray-400">({product.review_count || 0})</span>
                    </div>
                  )}

                  <h3 className="text-sm font-normal leading-snug mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-normal text-gray-900">{formatPrice(product)}</span>
                    {formatComparePrice(product) && (
                      <span className="text-sm text-gray-400 line-through font-light">{formatComparePrice(product)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-250 cursor-pointer"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
