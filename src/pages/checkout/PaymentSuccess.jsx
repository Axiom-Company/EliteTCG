import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const API_BASE_URL = 'http://localhost:3001';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      // Clear cart if redirected from checkout
      if (sessionStorage.getItem('clearCartOnSuccess') === 'true') {
        clearCart();
        sessionStorage.removeItem('clearCartOnSuccess');
      }

      // Get order ID from URL params or session storage
      const orderId = searchParams.get('order_id') || sessionStorage.getItem('lastOrderId');
      const orderNumber = sessionStorage.getItem('lastOrderNumber');

      if (orderId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
          if (res.ok) {
            const data = await res.json();
            setOrder(data.order);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      } else if (orderNumber) {
        // Just show the order number if we can't fetch details
        setOrder({ order_number: orderNumber });
      }

      setLoading(false);

      // Clear session storage
      sessionStorage.removeItem('lastOrderId');
      sessionStorage.removeItem('lastOrderNumber');
    };

    fetchOrder();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Thank you for your order!</h1>
        <p className="text-gray-600 mb-8">
          Your payment has been processed successfully.
        </p>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        ) : order ? (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
              </div>
              {order.total_amount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm font-medium text-gray-900">R{Number(order.total_amount).toLocaleString()}</span>
                </div>
              )}
              {order.status && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium text-green-600 capitalize">{order.status}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            We've sent a confirmation email with your order details.
          </p>
          <p className="text-sm text-gray-500">
            We'll email you again when your order ships.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="px-8 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
