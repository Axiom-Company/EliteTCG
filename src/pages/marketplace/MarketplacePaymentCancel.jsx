import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

const MarketplacePaymentCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // Navigate back to the previous page (the checkout they came from)
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Payment Cancelled" noindex />
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-[#E3350D]" />
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges were made.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-600">
            If you experienced any issues during payment, please try again
            or contact our support team for assistance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleTryAgain}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
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

export default MarketplacePaymentCancel;
