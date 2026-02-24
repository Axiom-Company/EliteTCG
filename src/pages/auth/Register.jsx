import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import pikachuImage from 'images/pikachu.png';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    accepts_marketing: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useCustomerAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        accepts_marketing: formData.accepts_marketing
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex">
      {/* Left - Yellow section with Pikachu */}
      <div className="hidden lg:flex w-1/2 bg-[#FFCB32] items-center justify-center relative overflow-hidden transform skew-x-6 origin-bottom-right">
        <div className="transform -skew-x-6 text-center px-12 z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join EliteTCG</h2>
          <p className="text-gray-800 text-lg mb-8">
            Create an account to buy, sell, and collect rare Pokemon cards
          </p>
          <img
            src={pikachuImage}
            alt="Pikachu"
            className="w-64 h-auto mx-auto drop-shadow-lg"
          />
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-600 mb-8">Join EliteTCG and start collecting</p>

          {error && (
            <p className="text-red-600 text-sm mb-6">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="+27 12 345 6789"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                id="accepts_marketing"
                name="accepts_marketing"
                type="checkbox"
                checked={formData.accepts_marketing}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 border-gray-300 rounded"
              />
              <label htmlFor="accepts_marketing" className="text-sm text-gray-600">
                Send me news about new releases and special offers
              </label>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="underline">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
