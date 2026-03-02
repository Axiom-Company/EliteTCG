import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

const MarketplacePaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Payment Successful" noindex />
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your order has been placed. The seller will be notified.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-600">
            You will receive a confirmation email shortly with your order details.
            The seller will arrange shipping to your provided address.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/marketplace"
            className="px-8 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePaymentSuccess;
