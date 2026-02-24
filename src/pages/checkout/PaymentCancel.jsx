import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was not completed. Don't worry, no charges were made.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-600">
            Your cart items are still saved. You can return to checkout when you're ready.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/checkout"
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Return to Checkout
          </Link>
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

export default PaymentCancel;
