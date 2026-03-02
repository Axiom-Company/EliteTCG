import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import PayflexPriceSplitter from '../Payflex/PayflexPriceSplitter';
import ProductCard from '../ProductCard/ProductCard';

const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useCustomerAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, w: 1, h: 1 });
  const [openAccordions, setOpenAccordions] = useState(new Set(['box', 'dims']));
  const [reviewFilter, setReviewFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const toggleAccordion = (key) => setOpenAccordions(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
  const imgContainerRef = useRef(null);

  // Touch magnifier support
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;

    const getPos = (e) => {
      const rect = el.getBoundingClientRect();
      const touch = e.touches[0];
      return { show: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, w: rect.width, h: rect.height };
    };

    const onTouchStart = (e) => setMagnifier(getPos(e));
    const onTouchMove = (e) => { e.preventDefault(); setMagnifier(getPos(e)); };
    const onTouchEnd = () => setMagnifier(m => ({ ...m, show: false }));

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [product]);

  const handleAddToCart = () => {
    if (product && product.inventory?.quantity > 0) {
      addToCart(product, quantity);
      openCart();
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setSelectedImage(0);
        setRelatedProducts([]);
        const response = await fetch(`${ELITE_API_URL}/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
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

  // Fetch related products once we have the product
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        // Try same category first
        let results = [];
        if (product.category) {
          const res = await fetch(`${ELITE_API_URL}/api/products?category=${product.category}&limit=8`);
          const data = await res.json();
          results = (data.products || []).filter(p => p.id !== product.id);
        }
        // Fall back to recent products if not enough
        if (results.length < 2) {
          const res = await fetch(`${ELITE_API_URL}/api/products?limit=8`);
          const data = await res.json();
          results = (data.products || []).filter(p => p.id !== product.id);
        }
        setRelatedProducts(results.slice(0, 4));
      } catch {
        // non-critical
      }
    };
    fetchRelated();
  }, [product]);

  // Fetch reviews
  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${ELITE_API_URL}/api/product-reviews/product/${product.id}`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch {
        // non-critical
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product]);

  const formatPrice = (price) => `R${Number(price).toLocaleString()}`;

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
    return { text: '', color: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center pt-[50px]">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
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
  const canNav = images.length > 1;
  const prevImage = () => setSelectedImage(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setSelectedImage(i => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-6 md:py-12 lg:py-16 px-2 md:px-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5 md:mb-10">
          <Link to="/products" className="hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer">
            <ChevronLeft />
            Back to Shop
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 lg:gap-16 max-w-5xl mx-auto">
          {/* Image Section */}
          <div className="space-y-3">
            {/* Main Image with arrows */}
            <div
              ref={imgContainerRef}
              className="relative aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden max-w-full md:max-w-[85%] md:mx-auto"
            >
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="w-[75%] h-[75%] md:w-[55%] md:h-[55%] object-contain cursor-crosshair"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                onLoad={(e) => setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                onMouseMove={(e) => {
                  const rect = imgContainerRef.current.getBoundingClientRect();
                  setMagnifier({
                    show: true,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    w: rect.width,
                    h: rect.height,
                  });
                }}
                onMouseLeave={() => setMagnifier(m => ({ ...m, show: false }))}
              />

              {/* Magnifier lens */}
              {magnifier.show && (() => {
                const ZOOM = 2.2;
                const LENS = 160;
                const { x, y, w, h } = magnifier;
                // Image is 75% of container on mobile, 55% on desktop
                const pct = window.innerWidth < 768 ? 0.75 : 0.55;
                const boxSize = w * pct;
                // Compute actual rendered dimensions inside object-contain
                const ar = imgNaturalSize.w / imgNaturalSize.h;
                const renderedW = ar >= 1 ? boxSize : boxSize * ar;
                const renderedH = ar >= 1 ? boxSize / ar : boxSize;
                const imgOffsetX = (w - renderedW) / 2;
                const imgOffsetY = (h - renderedH) / 2;
                // Mouse position relative to the rendered image
                const imgX = x - imgOffsetX;
                const imgY = y - imgOffsetY;
                return (
                  <div
                    className="absolute rounded-xl overflow-hidden border border-gray-200 shadow-xl pointer-events-none"
                    style={{
                      width: LENS,
                      height: LENS,
                      left: x - LENS / 2,
                      top: y - LENS / 2,
                      backgroundImage: `url(${getImageUrl(images[selectedImage])})`,
                      backgroundSize: `${renderedW * ZOOM}px ${renderedH * ZOOM}px`,
                      backgroundPosition: `${-(imgX * ZOOM - LENS / 2)}px ${-(imgY * ZOOM - LENS / 2)}px`,
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'white',
                    }}
                  />
                );
              })()}

              {/* Left arrow */}
              <button
                onClick={prevImage}
                disabled={!canNav}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronLeft />
              </button>

              {/* Right arrow */}
              <button
                onClick={nextImage}
                disabled={!canNav}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-full transition-all ${
                    i === selectedImage
                      ? 'w-4 h-1.5 bg-gray-900'
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Thumbnails (only if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-2 pt-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border transition-colors cursor-pointer flex items-center justify-center bg-white ${
                      selectedImage === index ? 'border-gray-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-[80%] h-[80%] object-contain"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {product.category.replace('_', ' ')}
              </span>
            )}

            <h1 className="text-xl md:text-3xl font-medium text-gray-900 mb-3 md:mb-4 leading-snug">{product.name}</h1>

            {(() => {
              const count = product.review_count ?? 0;
              const rating = count > 0 ? Math.round(product.rating || 0) : 0;
              return (
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                        fill="currentColor" stroke="none"
                        className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {count > 0 ? `${(product.rating || 0).toFixed(1)} (${count} review${count !== 1 ? 's' : ''})` : '(0)'}
                  </span>
                </div>
              );
            })()}

            <div className="flex items-baseline gap-3 mb-5 md:mb-6">
              <span className="text-2xl md:text-3xl font-medium text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-base md:text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            <PayflexPriceSplitter price={product.price} />

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
              {stockStatus.text && (
                <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
              )}
            </div>

            <div className="flex gap-3 mb-6 md:mb-8">
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.text === 'Out of Stock'}
                className="flex-1 md:flex-none py-3 px-8 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={() => product && toggleWishlist(product.id)}
                className={`w-12 h-12 flex items-center justify-center transition-colors cursor-pointer ${
                  product && isWishlisted(product.id) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={product && isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HeartIcon filled={product && isWishlisted(product.id)} />
              </button>
            </div>

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

        {/* Description */}
        {product.description && (
          <div className="max-w-5xl mx-auto mt-10 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* What's in the Box + Dimensions accordions */}
        {(product.box_contents || (product.dimensions && Object.values(product.dimensions).some(v => v))) && (
          <div className="max-w-5xl mx-auto mt-10 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Product Information</h2>
            <div className="divide-y divide-gray-100">

            {product.box_contents && (
              <div>
                <button
                  onClick={() => toggleAccordion('box')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">What's in the Box</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openAccordions.has('box') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordions.has('box') && (
                  <ul className="pb-5 space-y-2">
                    {product.box_contents.split('\n').filter(l => l.trim()).map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {product.dimensions && Object.values(product.dimensions).some(v => v) && (
              <div>
                <button
                  onClick={() => toggleAccordion('dims')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Product Dimensions</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openAccordions.has('dims') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordions.has('dims') && (
                  <div className="mb-5 border border-gray-200">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 text-gray-900 bg-gray-50 w-1/4 font-medium">Weight</td>
                        <td className="py-3 px-4 text-gray-700 w-1/4">{product.dimensions.weight ? `${product.dimensions.weight}g` : '—'}</td>
                        <td className="py-3 px-4 text-gray-900 bg-gray-50 w-1/4 font-medium border-l border-gray-200">Length</td>
                        <td className="py-3 px-4 text-gray-700 w-1/4">{product.dimensions.length ? `${product.dimensions.length}cm` : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900 bg-gray-50 font-medium">Width</td>
                        <td className="py-3 px-4 text-gray-700">{product.dimensions.width ? `${product.dimensions.width}cm` : '—'}</td>
                        <td className="py-3 px-4 text-gray-900 bg-gray-50 font-medium border-l border-gray-200">Height</td>
                        <td className="py-3 px-4 text-gray-700">{product.dimensions.height ? `${product.dimensions.height}cm` : '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Reviews */}
        {(() => {
          const avg = reviews.length
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : 0;
          const [filterRating, setFilterRating] = [reviewFilter, setReviewFilter];
          const filteredReviews = filterRating ? reviews.filter(r => r.rating === filterRating) : reviews;

          const StarRow = ({ rating: r, size = 14 }) => (
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width={size} height={size} viewBox="0 0 24 24"
                  fill="currentColor" stroke="none"
                  className={s <= Math.round(r) ? 'text-yellow-400' : 'text-gray-200'}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
          );

          const handleWriteReview = () => {
            if (isAuthenticated) {
              navigate(`/product/${id}/review`);
            } else {
              navigate('/login', { state: { from: { pathname: `/product/${id}/review` } } });
            }
          };

          return (
            <div className="mt-20 pt-12 border-t border-gray-100 max-w-5xl mx-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-medium text-gray-900">
                  Customer Reviews
                  {reviews.length > 0 && (
                    <span className="text-gray-400 font-normal ml-2 text-base">({reviews.length})</span>
                  )}
                </h2>
                <button
                  onClick={handleWriteReview}
                  className="text-sm font-medium text-gray-900 border border-gray-200 rounded-full px-5 py-2 hover:bg-gray-50 transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Two-column layout when reviews exist */}
              {reviews.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
                  {/* Left — summary */}
                  <div className="shrink-0 w-full sm:w-40 flex flex-col items-center gap-2">
                    <span className="text-6xl font-medium text-gray-900 tracking-tight">{avg.toFixed(1)}</span>
                    <StarRow rating={avg} size={20} />
                    <span className="text-sm text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    <div className="relative">
                      <button
                        onClick={() => setShowFilterMenu(p => !p)}
                        className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors mt-1"
                      >
                        {filterRating ? `${filterRating} ★` : 'Filter'}
                        <svg className={`w-3 h-3 transition-transform duration-150 ${showFilterMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showFilterMenu && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 min-w-[160px]">
                          {[null, 5, 4, 3, 2, 1].map((s) => (
                            <button
                              key={s ?? 'all'}
                              onClick={() => { setReviewFilter(s); setShowFilterMenu(false); }}
                              className={`w-full px-5 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between gap-3 ${
                                filterRating === s ? 'text-gray-900 font-medium' : 'text-gray-600'
                              }`}
                            >
                              {s ? `${s} Star` : 'All reviews'}
                              {filterRating === s && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right — review list */}
                  <div className="flex-1 min-w-0">
                    {reviewsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredReviews.length === 0 && (
                          <p className="text-sm text-gray-400">No {filterRating}-star reviews yet.</p>
                        )}
                        {filteredReviews.map((review) => (
                          <div key={review.id} className="py-5 border-b border-gray-100 last:border-0">
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-1.5">
                                <div>
                                  <p className="text-base font-medium text-gray-900 leading-none">{review.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(review.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <StarRow rating={review.rating} size={14} />
                              </div>
                              {(review.title || review.comment) && <div className="mt-3" />}
                              {review.title && (
                                <p className="text-base font-medium text-gray-800 mb-0.5">{review.title}</p>
                              )}
                              {review.comment && (
                                <p className="text-base text-gray-500 leading-relaxed">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No reviews state */
                reviewsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400 mb-4">No reviews yet — be the first to share your experience.</p>
                    <button
                      onClick={handleWriteReview}
                      className="text-sm font-medium text-gray-900 underline underline-offset-4"
                    >
                      Write a Review
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })()}

        {/* You might also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100 max-w-5xl mx-auto">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Products you might like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} imageSize="58%" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
