import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <div className="w-full max-w-[380px]">
        {/* Card */}
        <div className="bg-[#171717] border border-[#282828] rounded-xl p-8">
          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#3ECF8E] flex items-center justify-center mx-auto mb-4">
              <span className="text-[#0f0f0f] text-sm font-medium">E</span>
            </div>
            <h1 className="text-lg font-medium text-[#f1f1f1]">EliteTCG Admin</h1>
            <p className="text-sm text-[#6b6b6b] mt-1">Sign in to manage your store</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="px-3 py-2.5 bg-red-950/40 border border-red-900/40 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm text-[#c4c4c4]" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elitetcg.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] focus:ring-1 focus:ring-[#3ECF8E]/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[#c4c4c4]" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] focus:ring-1 focus:ring-[#3ECF8E]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#3ECF8E] hover:bg-[#2db87a] active:bg-[#25a067] text-[#0f0f0f] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#4a4a4a]">
              Demo: admin@elitetcg.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
