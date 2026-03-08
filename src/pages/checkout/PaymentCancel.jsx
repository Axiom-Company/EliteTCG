import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const PaymentCancel = () => {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6">
      <SEO title="Payment Cancelled" noindex />
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-sm text-gray-500 mb-8">
          Your payment was not processed. No charges were made.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/checkout"
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PaymentCancel;
