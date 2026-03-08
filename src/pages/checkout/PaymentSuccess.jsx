import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { PAYMENTS_API_URL } from '../../config/api';

const PaymentSuccess = () => {
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();

    const orderId = sessionStorage.getItem('eliteTCG_pendingOrderId');
    if (orderId) {
      sessionStorage.removeItem('eliteTCG_pendingOrderId');
      fetch(`${PAYMENTS_API_URL}/checkout/confirm/${orderId}`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [clearCart]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  const circleEdge = (
    <div className="relative h-[10px] bg-white" style={{
      maskImage: 'radial-gradient(circle 8px at 16px 10px, transparent 7.5px, black 8px)',
      WebkitMaskImage: 'radial-gradient(circle 8px at 16px 10px, transparent 7.5px, black 8px)',
      maskSize: '32px 10px',
      WebkitMaskSize: '32px 10px',
      maskPosition: '0 0',
      WebkitMaskPosition: '0 0',
      maskRepeat: 'repeat-x',
      WebkitMaskRepeat: 'repeat-x',
    }} />
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-100">
      <div className="w-full max-w-sm relative">
        {/* Side notches */}
        <div className="absolute left-[-10px] top-[65px] w-[20px] h-[20px] rounded-full bg-gray-100 z-10" />
        <div className="absolute right-[-10px] top-[65px] w-[20px] h-[20px] rounded-full bg-gray-100 z-10" />
        <div className="bg-white rounded-t-xl px-7 pt-8 pb-6 overflow-hidden" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

          {/* Header */}
          <div className="text-center mb-2">
            <p className="text-base font-medium tracking-widest uppercase text-gray-800">Payment Successful</p>
          </div>

          <p className="text-sm text-gray-300 mt-4 mb-4 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>

          {order ? (
            <>
              {/* Big total in center */}
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 tracking-wide mb-2">TOTAL PAID</p>
                <p className="text-3xl font-medium text-gray-900">R{(order.total_amount ?? 0).toLocaleString()}</p>
              </div>

              <p className="text-sm text-gray-300 mt-4 mb-4 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>

              {/* Order info */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ORDER</span>
                  <span className="text-gray-700">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">DATE</span>
                  <span className="text-gray-700">{formatDate(order.paid_at || order.created_at)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ACCOUNT</span>
                  <span className="text-gray-700">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">PAYMENT</span>
                  <span className="text-gray-700">PayFast</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">DELIVERY</span>
                  <span className="text-gray-700">
                    {(order.shipping_amount ?? 0) === 0 ? 'FREE' : `R${(order.shipping_amount ?? 0).toLocaleString()}`}
                  </span>
                </div>
                {order.shipping_service && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">COURIER</span>
                    <span className="text-gray-700">{order.shipping_service}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-300 mt-4 mb-4 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>

              {/* Items */}
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1 pr-3">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="text-gray-700 whitespace-nowrap">R{(item.total ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-300 mt-4 mb-4 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Your payment was confirmed.</p>
              </div>
              <p className="text-sm text-gray-300 mt-4 mb-4 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>
            </>
          )}

        </div>

        {/* Semicircle tear bottom */}
        {circleEdge}

        {/* Actions below */}
        <div className="flex flex-col items-center mt-8">
          <Link
            to="/"
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full text-center hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
