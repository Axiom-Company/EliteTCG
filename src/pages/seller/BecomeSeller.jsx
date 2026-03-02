import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ELITE_API_URL } from '@/config/api';
import SEO from '../../components/SEO/SEO';

const API_BASE_URL = ELITE_API_URL;

const BecomeSeller = () => {
  const { isAuthenticated, isSeller, getToken } = useCustomerAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    display_name: '',
    reason: '',
    experience: '',
    payfast_email: ''
  });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) {
        setChecking(false);
        return;
      }

      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/sellers/application-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setApplicationStatus(data.application);
      } catch (err) {
        console.error('Error checking application status:', err);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, getToken]);

  useEffect(() => {
    if (isSeller) {
      navigate('/seller/dashboard');
    }
  }, [isSeller, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/sellers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      setApplicationStatus(data.application);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SEO title="Become a Seller" description="Start selling Pokemon TCG cards on the EliteTCG marketplace. Apply to become a verified seller today." path="/become-seller" />
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <SEO title="Become a Seller" description="Start selling Pokemon TCG cards on the EliteTCG marketplace. Apply to become a verified seller today." path="/become-seller" />
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Seller</h1>
          <p className="text-gray-600 mb-8">
            Sign in to apply for a seller account and start listing your Pokemon cards on EliteTCG.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              state={{ from: { pathname: '/become-seller' } }}
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-900 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Application submitted or pending
  if (applicationStatus || success) {
    const status = applicationStatus?.status || 'pending';

    return (
      <section className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <SEO title="Become a Seller" description="Start selling Pokemon TCG cards on the EliteTCG marketplace. Apply to become a verified seller today." path="/become-seller" />
        <div className="max-w-lg text-center">
          {status === 'pending' && (
            <>
              <div className="w-16 h-16 bg-[#FFCB32] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⏳</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h1>
              <p className="text-gray-600 mb-4">
                Your seller application is being reviewed by our team. We'll notify you once a decision has been made.
              </p>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(applicationStatus?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </>
          )}

          {status === 'approved' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Approved!</h1>
              <p className="text-gray-600 mb-8">
                Congratulations! You can now start listing your cards on the marketplace.
              </p>
              <Link
                to="/seller/dashboard"
                className="inline-flex px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'rejected' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✕</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Not Approved</h1>
              <p className="text-gray-600 mb-4">
                Unfortunately, your application was not approved at this time.
              </p>
              {applicationStatus?.rejection_reason && (
                <p className="text-sm text-gray-700 bg-gray-100 p-4 rounded-lg mb-4">
                  {applicationStatus.rejection_reason}
                </p>
              )}
              <p className="text-sm text-gray-500">
                You may reapply after 30 days.
              </p>
            </>
          )}
        </div>
      </section>
    );
  }

  // Application form
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <SEO title="Become a Seller" description="Start selling Pokemon TCG cards on the EliteTCG marketplace. Apply to become a verified seller today." path="/become-seller" />
      <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Application</h1>
          <p className="text-gray-600 mb-8">Fill out the form below to apply</p>

          {error && (
            <p className="text-red-600 text-sm mb-6">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Display Name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="How buyers will see you"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
                Why do you want to sell?
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                minLength={20}
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors resize-none"
                placeholder="Tell us about your collection and what you plan to sell..."
              />
              <p className="mt-1 text-sm text-gray-400">{formData.reason.length}/1000</p>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1.5">
                Selling Experience <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                maxLength={1000}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors resize-none"
                placeholder="Have you sold cards before?"
              />
            </div>

            <div>
              <label htmlFor="payfast_email" className="block text-sm font-medium text-gray-700 mb-1.5">
                PayFast Email
              </label>
              <input
                id="payfast_email"
                name="payfast_email"
                type="email"
                value={formData.payfast_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="your-payfast@email.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Where you'll receive payments (10% platform fee applies)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </section>
  );
};

export default BecomeSeller;
