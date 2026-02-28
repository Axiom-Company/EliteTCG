import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { getMyOrders } from '../../services/orderApi';

const statusColors = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const OrderHistory = () => {
  const { isAuthenticated, getToken } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const data = await getMyOrders(token);
      setOrders(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">View and track your order history</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link
              to="/products"
              className="inline-flex px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id || order.order_number}
                to={`/orders/track?order=${order.order_number}&email=`}
                className="block p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.order_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {order.item_count && ` · ${order.item_count} item${order.item_count !== 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R{Number(order.total_zar).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">
                        {order.shipping_method === 'courier_guy' ? 'Courier Guy' : 'Collection'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Guest tracking link */}
        <div className="mt-10 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-3">Ordered as a guest?</p>
          <Link
            to="/orders/track"
            className="text-sm font-medium text-gray-900 underline hover:no-underline"
          >
            Track your order with your email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
