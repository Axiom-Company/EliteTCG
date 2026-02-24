import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import pikachuImage from 'images/pikachu.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">Sign in to your EliteTCG account</p>

          {error && (
            <p className="text-red-600 text-sm mb-6">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Yellow section with Pikachu */}
      <div className="hidden lg:flex w-1/2 bg-[#FFCB32] items-center justify-center relative overflow-hidden transform -skew-x-6 origin-bottom-left">
        <div className="transform skew-x-6 text-center px-12 z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Collecting</h2>
          <p className="text-gray-800 text-lg mb-8">
            Join thousands of collectors trading Pokemon cards on EliteTCG
          </p>
          <img
            src={pikachuImage}
            alt="Pikachu"
            className="w-64 h-auto mx-auto drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
