import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { trackOrder } from '../../services/orderApi';
import { getImageUrl } from '../../config/api';

const ORDER_STATUSES = [
  { key: 'pending_payment', label: 'Payment Pending', icon: '○' },
  { key: 'paid', label: 'Payment Received', icon: '○' },
  { key: 'confirmed', label: 'Confirmed', icon: '○' },
  { key: 'shipped', label: 'Shipped', icon: '○' },
  { key: 'in_transit', label: 'In Transit', icon: '○' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '○' },
  { key: 'delivered', label: 'Delivered', icon: '○' },
];

const getStatusIndex = (status) => ORDER_STATUSES.findIndex(s => s.key === status);

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if params provided
  useEffect(() => {
    const o = searchParams.get('order');
    const e = searchParams.get('email');
    if (o && e) {
      setOrderNumber(o);
      setEmail(e);
      handleSearch(o, e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (num, em) => {
    const searchNum = num || orderNumber;
    const searchEmail = em || email;

    if (!searchNum.trim() || !searchEmail.trim()) {
      setError('Please enter both order number and email');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await trackOrder(searchNum.trim(), searchEmail.trim());
      setOrder(data);
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const currentStatusIndex = order ? getStatusIndex(order.order_status) : -1;
  const isCancelled = order?.order_status === 'cancelled' || order?.order_status === 'refunded';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Back to shopping
          </Link>
          <h1 className="text-2xl font-medium text-gray-900 mt-4">Track Your Order</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your order number and email to see delivery status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Order Number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="PKM-00001"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </form>

        {/* Order Result */}
        {order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-xl font-medium text-gray-900 mt-0.5">{order.order_number}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-medium text-gray-900 mt-0.5">R{Number(order.total_zar).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`text-sm font-medium mt-0.5 ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>
                    {order.order_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payment</p>
                  <p className={`text-sm font-medium mt-0.5 ${order.payment_status === 'complete' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment_status?.replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Shipping</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {order.shipping_method === 'courier_guy' ? 'Courier Guy' : 'Collection'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            {!isCancelled && order.shipping_method === 'courier_guy' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Delivery Progress</h2>
                <div className="relative">
                  {ORDER_STATUSES.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={status.key} className="flex items-start gap-4 pb-6 last:pb-0">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? 'bg-gray-900 border-gray-900'
                              : 'bg-white border-gray-300'
                          } ${isCurrent ? 'ring-4 ring-gray-200' : ''}`} />
                          {index < ORDER_STATUSES.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[24px] ${
                              isCompleted && index < currentStatusIndex ? 'bg-gray-900' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        {/* Label */}
                        <div className="pb-2">
                          <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {status.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-gray-500 mt-0.5">Current status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.courier_tracking_number && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Courier Guy Tracking Number</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 font-mono">{order.courier_tracking_number}</p>
                  </div>
                )}
              </div>
            )}

            {/* Cancelled / Refunded */}
            {isCancelled && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm font-medium text-red-800">
                  This order has been {order.order_status === 'cancelled' ? 'cancelled' : 'refunded'}.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  If you have questions, please contact support.
                </p>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                        {(item.photo_url || item.tcg_image_small) ? (
                          <img src={getImageUrl(item.photo_url || item.tcg_image_small)} alt={item.product_name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity} × R{Number(item.unit_price_zar).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">R{Number(item.line_total_zar).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.shipping_address_line1 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Delivery Address</h2>
                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                  <p>{order.shipping_address_line1}</p>
                  <p>{order.shipping_city}, {order.shipping_province}</p>
                  <p>{order.shipping_postal_code}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && !order && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No order found. Please check your order number and email.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
