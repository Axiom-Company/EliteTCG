import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { ELITE_API_URL } from '../../config/api';
import ProductCard from '../../components/ProductCard/ProductCard';

const Wishlist = () => {
  const { wishlist } = useWishlist();
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
                <div className="p-4 space-y-2">
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showWishlist />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
