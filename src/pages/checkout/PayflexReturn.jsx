import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { verifyPayflexReturn } from '../../services/payflexApi';
import SEO from '../../components/SEO/SEO';

const PayflexReturn = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('loading'); // loading | approved | declined | cancelled | pending | error
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const orderNumber = searchParams.get('order') || '';
    const token = searchParams.get('token') || '';

    if (!orderNumber && !token) {
      setStatus('error');
      setErrorMessage('Missing order reference.');
      return;
    }

    verifyPayflexReturn(orderNumber, token)
      .then(data => {
        setOrderData(data);
        const paymentStatus = (data.payment_status || '').toLowerCase();

        if (paymentStatus === 'complete') {
          setStatus('approved');
          // Clear cart on successful payment
          if (sessionStorage.getItem('clearCartOnSuccess') === 'true') {
            clearCart();
            sessionStorage.removeItem('clearCartOnSuccess');
          }
        } else if (paymentStatus === 'failed') {
          setStatus('declined');
        } else if (paymentStatus === 'cancelled') {
          setStatus('cancelled');
        } else if (paymentStatus === 'pending') {
          setStatus('pending');
        } else {
          setStatus('pending');
        }
      })
      .catch(err => {
        setStatus('error');
        setErrorMessage(err.message);
      });
  }, [searchParams, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    approved: {
      icon: (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#e6faf5' }}>
          <svg className="w-8 h-8" style={{ color: '#00c9a7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      title: 'Payment Successful!',
      message: 'Your order is being processed. You will receive a confirmation email shortly.',
    },
    declined: {
      icon: (
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      title: 'Payment Not Approved',
      message: 'Unfortunately your Payflex application was not approved. You can try again or pay with PayFast.',
    },
    cancelled: {
      icon: (
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      ),
      title: 'Payment Cancelled',
      message: 'You cancelled the Payflex checkout. Your cart has been saved.',
    },
    pending: {
      icon: (
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="animate-spin h-8 w-8 border-3 border-blue-200 border-t-blue-500 rounded-full" />
        </div>
      ),
      title: 'Payment Processing',
      message: "Your payment is being processed. We'll email you when confirmed.",
    },
    error: {
      icon: (
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      title: 'Something Went Wrong',
      message: errorMessage || 'Please contact us at support@elitetcg.co.za.',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="min-h-screen bg-white">
      <SEO title="PayFlex Payment" noindex />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        {config.icon}

        <h1 className="text-2xl font-medium text-gray-900 mb-3">{config.title}</h1>
        <p className="text-sm text-gray-500 mb-8">{config.message}</p>

        {/* Order details */}
        {orderData && (
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium text-gray-900">{orderData.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-medium text-gray-900">R{orderData.total_zar}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium" style={{ color: '#00c9a7' }}>Payflex</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === 'approved' && (
            <>
              <Link
                to="/orders/track"
                className="block w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Track Your Order
              </Link>
              <Link
                to="/products"
                className="block w-full py-3 border border-gray-200 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </>
          )}

          {(status === 'declined' || status === 'cancelled') && (
            <>
              <Link
                to="/checkout"
                className="block w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Try Again with PayFast
              </Link>
              <Link
                to="/products"
                className="block w-full py-3 border border-gray-200 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </>
          )}

          {status === 'pending' && (
            <Link
              to="/products"
              className="block w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          )}

          {status === 'error' && (
            <>
              {orderData?.order_number && (
                <p className="text-xs text-gray-400 mb-2">
                  Reference: {orderData.order_number}
                </p>
              )}
              <Link
                to="/checkout"
                className="block w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Return to Checkout
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayflexReturn;
