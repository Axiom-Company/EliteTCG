import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCustomerAuth } from '../../contexts/AuthContext';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import SEO from '../SEO/SEO';
import { buildProductJsonLd } from '../../config/seo';
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
  const [reviewsOffset, setReviewsOffset] = useState(0);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, w: 1, h: 1 });
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [openAccordions, setOpenAccordions] = useState(new Set(['box', 'dims']));
  const [reviewFilter, setReviewFilter] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent'); // 'recent' | 'helpful' | 'stars_high' | 'stars_low'
  const [reportingId, setReportingId] = useState(null);
  const [reportReason, setReportReason] = useState(null);
  const [reportedIds, setReportedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('reported_reviews') || '[]'); } catch { return []; }
  });
  const toggleAccordion = (key) => setOpenAccordions(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
  const imgContainerRef = useRef(null);

  // Touch: long-press for magnifier, tap for fullscreen lightbox
  const longPressTimer = useRef(null);
  const touchMoved = useRef(false);
  const magnifierActive = useRef(false);

  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;

    const getPos = (e) => {
      const rect = el.getBoundingClientRect();
      const touch = e.touches[0];
      return { show: true, x: touch.clientX - rect.left, y: touch.clientY - rect.top, w: rect.width, h: rect.height };
    };

    const isOnImage = (e) => {
      const tag = e.target.tagName.toLowerCase();
      return tag === 'img' && !e.target.closest('button');
    };

    const onTouchStart = (e) => {
      touchMoved.current = false;
      magnifierActive.current = false;
      if (!isOnImage(e)) return;
      longPressTimer.current = setTimeout(() => {
        magnifierActive.current = true;
        setMagnifier(getPos(e));
      }, 300);
    };

    const onTouchMove = (e) => {
      touchMoved.current = true;
      if (magnifierActive.current) {
        e.preventDefault();
        setMagnifier(getPos(e));
      } else {
        clearTimeout(longPressTimer.current);
      }
    };

    const onTouchEnd = (e) => {
      clearTimeout(longPressTimer.current);
      if (magnifierActive.current) {
        setMagnifier(m => ({ ...m, show: false }));
        magnifierActive.current = false;
      } else if (!touchMoved.current && isOnImage(e)) {
        setLightbox({ open: true, index: selectedImage });
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer.current);
      setMagnifier(m => ({ ...m, show: false }));
      magnifierActive.current = false;
    }, { passive: true });

    return () => {
      clearTimeout(longPressTimer.current);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [product, selectedImage]);

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

  // Fetch reviews (first page)
  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${ELITE_API_URL}/api/product-reviews/product/${product.id}?limit=3&offset=0`);
        const data = await res.json();
        setReviews(data.reviews || []);
        setReviewsHasMore(data.hasMore || false);
        setReviewsOffset(3);
      } catch {
        // non-critical
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product]);

  const loadMoreReviews = async () => {
    setReviewsLoadingMore(true);
    try {
      const res = await fetch(`${ELITE_API_URL}/api/product-reviews/product/${product.id}?limit=3&offset=${reviewsOffset}`);
      const data = await res.json();
      setReviews(prev => [...prev, ...(data.reviews || [])]);
      setReviewsHasMore(data.hasMore || false);
      setReviewsOffset(prev => prev + 3);
    } catch {
      // non-critical
    } finally {
      setReviewsLoadingMore(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    const key = `helpful_${reviewId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r));
    try {
      await fetch(`${ELITE_API_URL}/api/product-reviews/${reviewId}/helpful`, { method: 'POST' });
    } catch { /* non-critical */ }
  };

  const submitReport = async (reviewId, reason) => {
    setReportingId(null);
    setReportReason(null);
    const updated = [...reportedIds, reviewId];
    setReportedIds(updated);
    localStorage.setItem('reported_reviews', JSON.stringify(updated));
    toast.success('Thank you — we\'ll look into it.');
    try {
      await fetch(`${ELITE_API_URL}/api/product-reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch { /* non-critical */ }
  };

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
    const isComingSoon = product?.badge === 'preorder' || product?.badge?.toLowerCase() === 'coming soon';
    if (qty === 0 && isComingSoon) return { text: 'Coming Soon', color: 'text-blue-500' };
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
      {product && <SEO title={product.name} description={product.description ? product.description.substring(0, 155) : `Buy ${product.name} at EliteTCG.`} path={`/product/${id}`} image={product.images?.[0] ? getImageUrl(product.images[0]) : undefined} type="product" jsonLd={buildProductJsonLd(product)} />}
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
                className="w-[85%] h-[85%] md:w-[75%] md:h-[75%] object-contain cursor-zoom-in"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                onLoad={(e) => setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                onClick={() => setLightbox({ open: true, index: selectedImage })}
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
                const pct = window.innerWidth < 768 ? 0.85 : 0.75;
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
          <div className="flex flex-col gap-6">
            {/* Title group */}
            <div>
              {product.category && (
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {product.category.replace('_', ' ')}
                </span>
              )}
              <h1 className="text-xl md:text-3xl font-medium text-gray-900 mt-2 leading-snug">{product.name}</h1>
              {(() => {
                const count = product.review_count ?? 0;
                const rating = count > 0 ? Math.round(product.rating || 0) : 0;
                return (
                  <div className="flex items-center gap-2 mt-3">
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

              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed mt-3">{product.description}</p>
              )}
            </div>

            {/* Price block */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-medium text-gray-900">{formatPrice(product.price)}</span>
                {product.compare_at_price && (
                  <span className="text-base md:text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                )}
              </div>
              <PayflexPriceSplitter price={product.price} />
              {stockStatus.text && (
                <span className={`text-sm font-medium mt-1 block ${stockStatus.color}`}>{stockStatus.text}</span>
              )}
            </div>

            {/* Quantity + CTA */}
            <div className="border-t border-gray-100 pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
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
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.text === 'Out of Stock' || stockStatus.text === 'Coming Soon'}
                className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {stockStatus.text === 'Coming Soon' ? 'Coming Soon' : 'Add to Cart'}
              </button>
              <button
                onClick={() => product && toggleWishlist(product.id)}
                className={`w-full py-3 border text-sm font-medium rounded-full transition-colors cursor-pointer ${
                  product && isWishlisted(product.id)
                    ? 'border-gray-900 text-gray-900 hover:bg-gray-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                {product && isWishlisted(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Meta */}
            <div className="border-t border-gray-100 pt-6 space-y-2.5">
              {product.sku && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 w-24">SKU</span>
                  <span className="text-gray-700">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 w-24">Category</span>
                  <span className="text-gray-700 capitalize">{product.category.replace('_', ' ')}</span>
                </div>
              )}
              {product.sets && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 w-24">Set</span>
                  <span className="text-gray-700">{product.sets.name}</span>
                </div>
              )}
            </div>

          </div>
        </div>

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
            : (product.rating || 0);
          const totalCount = reviews.length || product.review_count || 0;
          const [filterRating, setFilterRating] = [reviewFilter, setReviewFilter];
          const filteredReviews = (filterRating ? reviews.filter(r => r.rating === filterRating) : reviews)
            .slice()
            .sort((a, b) => {
              if (reviewSort === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
              if (reviewSort === 'stars_high') return b.rating - a.rating;
              if (reviewSort === 'stars_low') return a.rating - b.rating;
              return new Date(b.created_at) - new Date(a.created_at);
            });

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

          // Rating distribution bars
          const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviews.forEach(r => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++; });
          const maxCount = Math.max(...Object.values(ratingCounts), 1);

          const handleWriteReview = () => {
            navigate(`/product/${id}/review`);
          };

          const timeAgo = (dateStr) => {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'Just now';
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            const days = Math.floor(hrs / 24);
            if (days < 7) return `${days}d ago`;
            if (days < 30) return `${Math.floor(days / 7)}w ago`;
            return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
          };

          return (
            <div className="mt-16 md:mt-20 max-w-5xl mx-auto">

              <div>

                {/* Header bar */}
                <div className="pb-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-medium text-gray-900">Reviews</h2>
                    <button
                      onClick={handleWriteReview}
                      className="flex items-center gap-1.5 text-sm font-medium text-white bg-gray-900 rounded-full px-5 py-2.5 hover:bg-gray-800 active:scale-[0.97] transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14"/><path d="M5 12h14"/>
                      </svg>
                      Write a Review
                    </button>
                  </div>
                </div>

                {totalCount > 0 ? (
                  <>
                    {/* Summary + distribution */}
                    <div className="py-6 md:py-8">
                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">

                        {/* Big number + stars */}
                        <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2 shrink-0">
                          <span className="text-5xl md:text-6xl font-medium text-gray-900 tracking-tight leading-none">{avg.toFixed(1)}</span>
                          <div className="flex flex-col gap-1.5 sm:items-center">
                            <StarRow rating={avg} size={22} />
                            <span className="text-sm text-gray-400">{totalCount} review{totalCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Distribution bars */}
                        <div className="flex-1 w-full flex flex-col gap-2">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewFilter(filterRating === star ? null : star)}
                              className="flex items-center gap-3 group"
                            >
                              <span className="text-sm text-gray-500 w-4 text-right shrink-0">{star}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-400 shrink-0">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${filterRating === star ? 'bg-gray-900' : 'bg-yellow-400 group-hover:bg-yellow-500'}`}
                                  style={{ width: `${(ratingCounts[star] / maxCount) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 w-6 text-right shrink-0">{ratingCounts[star]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Filter / sort pills */}
                    <div className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { value: 'recent', label: 'Recent' },
                          { value: 'helpful', label: 'Most Helpful' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setReviewSort(opt.value)}
                            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                              reviewSort === opt.value
                                ? 'bg-gray-900 border-gray-900 text-white font-medium'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                        {filterRating && (
                          <button
                            onClick={() => setReviewFilter(null)}
                            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            {filterRating}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-400">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 text-gray-400">
                              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="pb-6 md:pb-8">
                      {reviewsLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="flex flex-col mt-2">
                          {filteredReviews.length === 0 && (
                            <p className="text-sm text-gray-400 py-6 text-center">No {filterRating ? `${filterRating}-star ` : ''}reviews yet.</p>
                          )}
                          {filteredReviews.map((review, idx) => {
                            const hasHelped = !!localStorage.getItem(`helpful_${review.id}`);
                            const hasReported = reportedIds.includes(review.id);
                            return (
                              <div key={review.id} className={`py-5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <StarRow rating={review.rating} size={14} />
                                  <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                                </div>

                                {review.title && (
                                  <p className="text-sm font-medium text-gray-900 mb-1">{review.title}</p>
                                )}
                                {review.comment && (
                                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                )}

                                <div className="flex items-center gap-3 mt-3">
                                  <span className="text-xs text-gray-500">{review.name}</span>
                                  <span className="text-gray-200">·</span>
                                  <button
                                    onClick={() => handleHelpful(review.id)}
                                    disabled={hasHelped}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      hasHelped
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={hasHelped ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                    </svg>
                                    Helpful{(review.helpful_count || 0) > 0 ? ` (${review.helpful_count})` : ''}
                                  </button>
                                  <span className="text-gray-200">·</span>
                                  {!hasReported ? (
                                    <button
                                      onClick={() => setReportingId(review.id)}
                                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      Report
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-300">Reported</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {!filterRating && reviewsHasMore && (
                            <div className="flex justify-center pt-2">
                              <button
                                onClick={loadMoreReviews}
                                disabled={reviewsLoadingMore}
                                className="px-6 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {reviewsLoadingMore ? (
                                  <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                    Loading...
                                  </span>
                                ) : 'Show more reviews'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  reviewsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">No reviews yet</p>
                      <p className="text-xs text-gray-400 mb-5">Be the first to share your experience</p>
                      <button
                        onClick={handleWriteReview}
                        className="text-sm font-medium text-white bg-gray-900 rounded-full px-6 py-2.5 hover:bg-gray-800 active:scale-[0.97] transition-all"
                      >
                        Write a Review
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })()}

        {/* Report modal */}
        {reportingId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setReportingId(null); setReportReason(null); }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {!reportReason ? (
                <>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Report review</h3>
                  <p className="text-sm text-gray-500 mb-5">Why are you reporting this review?</p>
                  <div className="flex flex-col gap-1">
                    {['Spam or advertising', 'Inappropriate content', 'Fake review', 'Other'].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className="text-sm text-left text-gray-700 hover:text-gray-900 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setReportingId(null); setReportReason(null); }}
                    className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Confirm report</h3>
                  <p className="text-sm text-gray-500 mb-1">You're reporting this review for:</p>
                  <p className="text-sm font-medium text-gray-800 mb-5">"{reportReason}"</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => submitReport(reportingId, reportReason)}
                      className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
                    >
                      Submit report
                    </button>
                    <button
                      onClick={() => setReportReason(null)}
                      className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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

      {/* Fullscreen image lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setLightbox({ open: false, index: 0 })}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white z-10"
            onClick={() => setLightbox({ open: false, index: 0 })}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(images[lightbox.index])}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: (lb.index - 1 + images.length) % images.length })); }}
              >
                <ChevronLeft />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: (lb.index + 1) % images.length })); }}
              >
                <ChevronRight />
              </button>
            </>
          )}

          {/* Thumbnail dots */}
          {images.length > 1 && (
            <div className="flex gap-2 py-4" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(lb => ({ ...lb, index: i }))}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    lightbox.index === i ? 'border-white' : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
