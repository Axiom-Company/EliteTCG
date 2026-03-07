import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Truck, ArrowLeft, Clock, CheckCircle2, XCircle, CreditCard, Hash, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PAYMENTS_API_URL, ELITE_API_URL, getImageUrl } from '../../config/api';
import SEO from '../../components/SEO/SEO';

const STATUS_STEPS = [
  { key: 'paid', label: 'Confirmed', desc: 'Payment received' },
  { key: 'shipped', label: 'Shipped', desc: 'Handed to courier' },
  { key: 'in_transit', label: 'In Transit', desc: 'On its way to you' },
  { key: 'delivered', label: 'Delivered', desc: 'Order complete' },
];

const getStepIndex = (status) => {
  const map = { paid: 0, confirmed: 0, shipped: 1, in_transit: 2, delivered: 3 };
  return map[status] ?? -1;
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Stars = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"
        className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

/* ─── Progress bar (vertical timeline) ───────────────────── */

const ProgressTimeline = ({ status, order }) => {
  const currentStep = getStepIndex(status);

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-5 py-4">
        <Clock className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-medium">Payment pending</p>
          <p className="text-xs text-amber-500 mt-0.5">We haven't received your payment yet.</p>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-5 py-4">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-medium">Order cancelled</p>
          <p className="text-xs text-red-400 mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  if (currentStep < 0) return null;

  return (
    <div className="relative">
      {/* Horizontal progress for desktop */}
      <div className="flex items-start">
        {STATUS_STEPS.map((step, i) => (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors ${
                  i <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                i <= currentStep
                  ? 'bg-gray-900'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {i <= currentStep ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs text-gray-400">{i + 1}</span>
              )}
            </div>
            <p className={`text-xs mt-2.5 text-center font-medium ${
              i <= currentStep ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {step.label}
            </p>
            <p className={`text-[11px] mt-0.5 text-center hidden sm:block ${
              i <= currentStep ? 'text-gray-500' : 'text-gray-300'
            }`}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Item row ────────────────────────────────────────────── */

const ItemRow = ({ item, prod }) => (
  <div className="flex gap-4 py-4">
    <Link
      to={prod?.slug ? `/product/${prod.slug}` : '#'}
      className="w-20 h-20 sm:w-24 sm:h-24 bg-white shrink-0 rounded flex items-center justify-center"
    >
      <img src={getImageUrl(item.product_image)} alt="" className="w-full h-full object-contain" />
    </Link>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <Link to={prod?.slug ? `/product/${prod.slug}` : '#'} className="text-sm font-medium text-gray-900 hover:underline line-clamp-1">
          {item.product_name}
        </Link>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium text-gray-900">R{(item.total ?? 0).toFixed(2)}</p>
          {item.quantity > 1 && (
            <p className="text-[11px] text-gray-400">R{(item.unit_price ?? 0).toFixed(2)} ea</p>
          )}
        </div>
      </div>
      {prod?.category && (
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{prod.category.replace(/_/g, ' ')}</p>
      )}
      {prod?.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{prod.description}</p>
      )}
      <div className="flex items-center gap-3 mt-1.5">
        <span className="text-xs text-gray-500">Qty {item.quantity}</span>
        {prod && <Stars rating={prod.rating} />}
      </div>
    </div>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const DetailSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-6 bg-gray-100 rounded w-56" />
    <div className="h-4 bg-gray-100 rounded w-36" />
    <div className="flex items-start justify-around py-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100" />
          <div className="h-3 w-14 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {[1,2].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Order updates timeline ──────────────────────────────── */

const OrderUpdates = ({ order }) => {
  const updates = [];

  if (order.created_at) {
    updates.push({ date: order.created_at, label: 'Order placed', desc: `Order ${order.order_number} was placed.` });
  }
  if (order.paid_at) {
    updates.push({ date: order.paid_at, label: 'Payment confirmed', desc: 'Your payment was successfully processed.' });
  }
  if (order.shipped_at) {
    updates.push({ date: order.shipped_at, label: 'Order shipped', desc: order.tracking_number ? `Tracking number: ${order.tracking_number}` : 'Your order has been dispatched.' });
  }
  if (order.delivered_at) {
    updates.push({ date: order.delivered_at, label: 'Delivered', desc: 'Your order has been delivered.' });
  }
  if (order.status === 'cancelled' && order.cancelled_at) {
    updates.push({ date: order.cancelled_at, label: 'Order cancelled', desc: 'This order was cancelled.' });
  }

  // Sort newest first
  updates.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (updates.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Order Updates</p>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

        <div className="space-y-5">
          {updates.map((update, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                i === 0 ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{update.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{update.desc}</p>
                <p className="text-[11px] text-gray-400 mt-1">{fmtDateTime(update.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────── */

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.email) { setLoading(false); return; }

    fetch(`${PAYMENTS_API_URL}/checkout/my-orders?email=${encodeURIComponent(user.email)}`)
      .then(r => { if (!r.ok) throw new Error('Failed to load order'); return r.json(); })
      .then(d => {
        const found = (d.orders || []).find(o => o.id === orderId);
        if (!found) throw new Error('Order not found');
        setOrder(found);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId, user, authLoading, isAuthenticated]);

  const fetchProductDetails = useCallback(async (items) => {
    const ids = [...new Set(items.map(i => i.product_id).filter(Boolean))];
    if (ids.length === 0) return;
    const results = {};
    await Promise.all(ids.map(id =>
      fetch(`${ELITE_API_URL}/api/products/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.product) results[id] = d.product; })
        .catch(() => {})
    ));
    setProductMap(results);
  }, []);

  useEffect(() => {
    if (order?.items?.length > 0) fetchProductDetails(order.items);
  }, [order, fetchProductDetails]);

  const items = order?.items || [];
  const addr = order?.shipping_address;

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <SEO title="Order Details" noindex />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="text-lg font-medium text-gray-900 mb-1">Sign in to view this order</p>
          <Link to="/login" className="inline-flex items-center h-10 px-6 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors mt-4 rounded-full">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO title={order ? `Order ${order.order_number}` : 'Order Details'} noindex />

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/orders" className="hover:text-gray-700 transition-colors">My Orders</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">Order Details</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>

        {(authLoading || loading) ? (
          <DetailSkeleton />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : order && (
          <div className="space-y-10">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2">Order {order.order_number}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {fmtDate(order.created_at)}
                </span>
                {order.paid_at && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Paid {fmtDate(order.paid_at)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  R{(order.total_amount ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <ProgressTimeline status={order.status} order={order} />
            </div>

            {/* Tracking */}
            {order.tracking_number && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                    <code className="text-xs text-gray-500">{order.tracking_number}</code>
                  </div>
                </div>
                <a
                  href={`https://www.thecourierguy.co.za/tracking?waybill=${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 transition-colors shrink-0"
                >
                  Track
                </a>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Items <span className="text-gray-300">({items.length})</span>
              </p>
              <div className="border border-gray-200 rounded-lg pl-2 pr-4 py-1 divide-y divide-gray-100">
                {items.map((item, i) => (
                  <ItemRow key={i} item={item} prod={productMap[item.product_id]} />
                ))}
              </div>
            </div>

            {/* Summary + Shipping side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Summary</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">R{(order.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">R{(order.shipping_amount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2.5 flex justify-between font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R{(order.total_amount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Delivery</p>
                <div className="space-y-3 text-sm">
                  {addr && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-900">{addr.street_address}</p>
                        <p className="text-xs text-gray-500">
                          {[addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      {order.shipping_service && (
                        <p className="text-gray-900">{order.shipping_service}</p>
                      )}
                      {order.estimated_delivery_days && (
                        <p className="text-xs text-gray-500">Est. {order.estimated_delivery_days} business days</p>
                      )}
                      {!order.shipping_service && !order.estimated_delivery_days && (
                        <p className="text-gray-500">Standard delivery</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order updates timeline */}
            <OrderUpdates order={order} />

            {/* Need help */}
            <div className="border-t border-gray-100 pt-8 text-center">
              <p className="text-sm text-gray-400 mb-2">Need help with this order?</p>
              <a
                href="mailto:admin@elitetcg.co.za"
                className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
