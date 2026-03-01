import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

const Wishlist = () => {
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          wishlist.map(id => fetch(`${ELITE_API_URL}/api/products/${id}`).then(r => r.ok ? r.json() : null))
        );
        setProducts(results.filter(Boolean).map(r => r.product).filter(Boolean));
      } catch (err) {
        console.error('Failed to fetch wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [wishlist]);

  const formatPrice = (product) => {
    const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.price || 0).toFixed(2)}`;
  };

  const formatComparePrice = (product) => {
    if (!product.compare_at_price) return null;
    const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
    return `${symbol}${Number(product.compare_at_price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Wishlist</h1>
          {!loading && products.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">{products.length} item{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: Math.min(wishlist.length, 8) }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-50" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                  <div className="h-5 bg-gray-100 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6">Heart products to save them here.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 py-2.5 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const comparePrice = formatComparePrice(product);
              const wishlisted = isWishlisted(product.id);

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug || product.id}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden"
                >
                  <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
                    {product.images?.[0] ? (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-[70%] h-[70%] object-contain"
                      />
                    ) : (
                      <div className="text-gray-200">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect width="18" height="18" x="3" y="3" rx="2"/>
                        </svg>
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                      aria-label="Remove from wishlist"
                      className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full transition-all duration-150 cursor-pointer ${
                        wishlisted ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="px-3 pt-1.5 pb-2 flex flex-col items-center text-center">
                    <h3 className="text-sm font-normal leading-snug mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-normal text-gray-900">{formatPrice(product)}</span>
                      {comparePrice && (
                        <span className="text-sm text-gray-400 line-through font-light">{comparePrice}</span>
                      )}
                    </div>
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

export default Wishlist;
