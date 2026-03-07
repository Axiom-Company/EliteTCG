import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PAYMENTS_API_URL, ELITE_API_URL, getImageUrl } from '../../config/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import SEO from '../../components/SEO/SEO';


/* ─── Single order card — items listed like a cart ────────── */

const OrderCard = ({ order, onClick }) => {
  const items = order.items || [];

  return (
    <div
      onClick={onClick}
      className="space-y-3 cursor-pointer"
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-4 hover:bg-gray-50 transition-colors">
          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={getImageUrl(item.product_image)}
              alt=""
              className="w-[80%] h-[80%] object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
              {item.quantity > 1 && (
                <span className="text-xs text-gray-400">· R{(item.unit_price ?? 0).toFixed(2)} each</span>
              )}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 shrink-0">R{(item.total ?? 0).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

/* ─── Recommendations ─────────────────────────────────────── */

const Recommendations = ({ products }) => {
  const scrollRef = useRef(null);
  if (!products || products.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">You might also like</p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scroll('left')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p.id} className="w-44 sm:w-48 shrink-0">
            <ProductCard product={p} imageSize="65%" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Skeletons ──────────────────────────────────────────── */

const ContentSkeleton = () => (
  <div className="animate-pulse space-y-10">
    {[1,2].map(n => (
      <div key={n}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-100 rounded w-36" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
        <div className="space-y-3">
          {[1,2].map(i => (
            <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ─── Main ───────────────────────────────────────────────── */

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.email) { setLoading(false); return; }
    fetch(`${PAYMENTS_API_URL}/checkout/my-orders?email=${encodeURIComponent(user.email)}`)
      .then(r => { if (!r.ok) throw new Error('Failed to load orders'); return r.json(); })
      .then(d => setOrders(d.orders || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, isAuthenticated]);

  const fetchProductDetails = useCallback(async (orderList) => {
    const ids = [...new Set(orderList.flatMap(o => (o.items || []).map(i => i.product_id).filter(Boolean)))];
    if (ids.length === 0) return;
    const results = {};
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    for (const chunk of chunks) {
      await Promise.all(chunk.map(id =>
        fetch(`${ELITE_API_URL}/api/products/${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.product) results[id] = d.product; })
          .catch(() => {})
      ));
    }
    const categories = [...new Set(Object.values(results).map(p => p.category).filter(Boolean))];
    if (categories.length > 0) {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/products?category=${categories[0]}&limit=16`);
        const data = await res.json();
        const ordered = new Set(ids);
        setRecommendations((data.products || []).filter(p => !ordered.has(p.id)).slice(0, 12));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) fetchProductDetails(orders);
  }, [orders, fetchProductDetails]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <SEO title="My Orders" noindex />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-lg font-medium text-gray-900 mb-1">Sign in to view your orders</p>
          <p className="text-sm text-gray-400 mb-6">Track deliveries and view purchase history.</p>
          <Link to="/login" className="inline-flex items-center h-10 px-6 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO title="My Orders" noindex />

      <div className="max-w-3xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">My Orders</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Order history</h1>
        {!loading && orders.length > 0 && (
          <p className="text-sm text-gray-400 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        )}
        {!loading && orders.length === 0 && !error && <div className="mb-8" />}

        {(authLoading || loading) ? (
          <ContentSkeleton />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-900 mb-1">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">When you place an order, it will show up here.</p>
            <Link to="/products" className="inline-flex items-center h-10 px-6 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-colors">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.slice(0, visibleCount).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/orders/${order.id}`)}
                />
              ))}
            </div>
            {visibleCount < orders.length && (
              <button
                onClick={() => setVisibleCount(c => c + 3)}
                className="mt-8 mx-auto flex items-center px-6 py-2.5 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                Load More
              </button>
            )}
          </>
        )}

        {!loading && recommendations.length > 0 && (
          <Recommendations products={recommendations} />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
