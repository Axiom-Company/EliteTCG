import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { trackOrder } from '../../services/orderApi';
import SEO from '../../components/SEO/SEO';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      if (sessionStorage.getItem('clearCartOnSuccess') === 'true') {
        clearCart();
        sessionStorage.removeItem('clearCartOnSuccess');
      }

      const orderNumber = searchParams.get('order_number') || sessionStorage.getItem('lastOrderNumber');
      const email = searchParams.get('email') || sessionStorage.getItem('lastOrderEmail');

      if (orderNumber && email) {
        try {
          const data = await trackOrder(orderNumber, email);
          setOrder(data);
        } catch {
          if (orderNumber) setOrder({ order_number: orderNumber });
        }
      } else if (orderNumber) {
        setOrder({ order_number: orderNumber });
      }

      setLoading(false);
      sessionStorage.removeItem('lastOrderNumber');
      sessionStorage.removeItem('lastOrderEmail');
    };

    fetchOrder();
  }, [searchParams, clearCart]);

  const statusLabel = (status) => {
    const map = {
      pending_payment: 'Pending Payment',
      paid: 'Payment Received',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
    };
    return map[status] || status;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Payment Successful" noindex />
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Thank you for your order!</h1>
        <p className="text-gray-600 mb-8">Your payment has been processed successfully.</p>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
          </div>
        ) : order ? (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
              </div>
              {order.total_zar && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm font-medium text-gray-900">R{Number(order.total_zar).toLocaleString()}</span>
                </div>
              )}
              {order.order_status && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium text-green-600">{statusLabel(order.order_status)}</span>
                </div>
              )}
              {order.shipping_method && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.shipping_method === 'courier_guy' ? 'Courier Guy Delivery' : 'Local Collection'}
                  </span>
                </div>
              )}
              {order.courier_tracking_number && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tracking</span>
                  <span className="text-sm font-medium text-gray-900">{order.courier_tracking_number}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">We've sent a confirmation email with your order details.</p>
          {order?.shipping_method === 'courier_guy' && (
            <p className="text-sm text-gray-500">You'll receive tracking information once your order ships via Courier Guy.</p>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {order?.order_number && (
            <Link
              to={`/orders/track?order=${order.order_number}`}
              className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Track Your Order
            </Link>
          )}
          <Link
            to="/products"
            className="px-8 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
