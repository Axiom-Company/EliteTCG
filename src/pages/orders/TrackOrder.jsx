import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PAYMENTS_API_URL } from '../../config/api';
import SEO from '../../components/SEO/SEO';

const STATUS_STEPS = [
  { key: 'paid', label: 'Order Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

const getStepIndex = (status) => {
  const map = { paid: 0, confirmed: 0, shipped: 1, in_transit: 2, delivered: 3 };
  return map[status] ?? -1;
};

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({ email });
      const res = await fetch(`${PAYMENTS_API_URL}/checkout/track/${orderNumber}?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Order not found');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <section className="bg-white min-h-[60vh]">
      <SEO title="Track Order" />
      <div className="container max-w-lg mx-auto px-6 py-10 md:py-14">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Track your order</h1>
        <p className="text-sm text-gray-500 mb-8">Enter your order number and email to view the status.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">Order number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              placeholder="ETS-XXXXXX-XXXX"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm shadow-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm shadow-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? 'Looking up...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-8">
            {/* Order header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order</p>
                <p className="text-lg font-medium text-gray-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-lg font-medium text-gray-900">R{order.total_amount?.toFixed(2)}</p>
              </div>
            </div>

            {/* Status timeline */}
            {currentStep >= 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Status</p>
                <div className="flex items-start">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {/* Connector line */}
                      {i > 0 && (
                        <div
                          className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                            i <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      {/* Dot */}
                      <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                          i <= currentStep
                            ? 'bg-gray-900'
                            : 'bg-white border-2 border-gray-200'
                        }`}
                      >
                        {i <= currentStep && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className={`text-xs mt-2 text-center ${
                        i <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.status === 'pending' && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                Payment pending — we haven't received your payment yet.
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                This order has been cancelled.
              </div>
            )}

            {/* Tracking number */}
            {order.tracking_number && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Tracking number</p>
                <div className="flex items-center gap-3">
                  <code className="text-sm bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
                    {order.tracking_number}
                  </code>
                  <a
                    href={`https://www.thecourierguy.co.za/tracking?waybill=${order.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
                  >
                    Track on Courier Guy
                  </a>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Items</p>
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                    </div>
                    <p className="text-gray-900 font-medium">
                      R{(item.total || item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrackOrder;
