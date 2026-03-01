import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
const API_BASE = 'http://localhost:3001';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setRef, isVisible } = useScrollAnimation(products.length);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products?limit=8`);
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


  const getBadgeClass = (badge) => {
    return 'bg-gray-900 text-white';
  };

  const getImageUrl = (product) => {
    if (!product.images?.[0]) return null;
    const img = product.images[0];
    return img.startsWith('http') ? img : `${API_BASE}${img}`;
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
            {products.map((product, i) => (
              <Link
                key={product.id}
                to={`/product/${product.slug || product.id}`}
                className="card-3d flex flex-col bg-white rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                  {getImageUrl(product) ? (
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="max-w-[70%] max-h-[70%] object-contain"
                    />
                  ) : (
                    <div className="text-gray-300">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                  )}

                  {product.badge && product.badge !== 'none' && (
                    <span className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full capitalize ${getBadgeClass(product.badge)}`}>
                      {product.badge}
                    </span>
                  )}

                </div>

                <div className="px-3 pt-1.5 pb-2 flex flex-col items-center text-center">
                  {(product.rating > 0 || product.review_count > 0) && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-gold text-xs">★</span>
                      <span className="text-xs font-medium text-gray-700">{product.rating || 0}</span>
                      <span className="text-xs text-gray-400">({product.review_count || 0})</span>
                    </div>
                  )}

                  <h3 className="text-sm font-normal leading-snug mb-1 line-clamp-2">
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
