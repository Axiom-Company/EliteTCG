import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import PayflexPriceSplitter from '../Payflex/PayflexPriceSplitter';

const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    if (product && product.inventory?.quantity > 0) {
      addToCart(product, quantity);
      openCart();
    }
  };

  // Scroll to top when page loads or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ELITE_API_URL}/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'ZAR': return 'R';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return 'R';
    }
  };

  const formatPrice = (price, currency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${Number(price).toFixed(2)}`;
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

  const getStockStatus = () => {
    const qty = product?.inventory?.quantity ?? 0;
    if (qty === 0) return { text: 'Out of Stock', color: 'text-red-500' };
    if (qty <= (product?.inventory?.low_stock_threshold || 5)) return { text: `Only ${qty} left`, color: 'text-orange-500' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const images = product.images?.length > 0 ? product.images : [null];

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <Link to="/" className="hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer">
            <ChevronLeft />
            Back to Shop
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 p-6 max-w-[90%]">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="w-auto h-full max-h-[500px] object-contain"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
            </div>

            {/* Product Name */}
            <p className="text-sm italic text-gray-500 mb-2">{product.name}</p>

            {/* Badge Text */}
            {product.badge && product.badge !== 'none' && (
              <div className="text-sm font-medium text-gray-600 capitalize mb-4">
                {product.badge === 'preorder' ? 'Coming Soon' : product.badge}
              </div>
            )}

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-gray-50"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {product.category.replace('_', ' ')}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl font-medium text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            {(product.rating > 0 || product.review_count > 0) && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating || 0} ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-medium text-gray-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compare_at_price, product.currency)}
                </span>
              )}
            </div>

            {/* Payflex installment widget */}
            <PayflexPriceSplitter price={product.price} />

            {/* Stock Status */}
            <div className={`text-sm font-medium mb-6 ${stockStatus.color}`}>
              {stockStatus.text}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-900">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product?.inventory?.quantity || 99)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.text === 'Out of Stock'}
                className="py-3 px-8 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={() => product && toggleWishlist(product.id)}
                className={`w-12 h-12 flex items-center justify-center transition-colors cursor-pointer ${
                  product && isWishlisted(product.id)
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={product && isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HeartIcon filled={product && isWishlisted(product.id)} />
              </button>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {product.sku && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">SKU:</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Category:</span>
                  <span className="text-gray-900 capitalize">{product.category.replace('_', ' ')}</span>
                </div>
              )}
              {product.sets && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Set:</span>
                  <span className="text-gray-900">{product.sets.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
