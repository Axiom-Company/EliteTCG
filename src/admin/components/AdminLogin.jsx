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
    <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="w-full max-w-[360px] flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-[#f1f1f1]">Sign in</h1>
          <p className="text-sm text-[#6b6b6b]">Enter your credentials to access the admin panel</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {error && (
              <div className="px-3 py-2.5 bg-red-950/40 border border-red-900/40 text-red-400 text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none text-[#c4c4c4]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@elitetcg.com"
                className="autofill-dark h-10 w-full rounded-md border border-[#282828] bg-transparent px-3 text-sm text-[#f1f1f1] shadow-xs placeholder-[#4a4a4a] focus:outline-none focus:ring-1 focus:ring-[#f1f1f1]/30 focus:border-[#444] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none text-[#c4c4c4]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="autofill-dark h-10 w-full rounded-md border border-[#282828] bg-transparent px-3 text-sm text-[#f1f1f1] shadow-xs placeholder-[#4a4a4a] focus:outline-none focus:ring-1 focus:ring-[#f1f1f1]/30 focus:border-[#444] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-[#f1f1f1] text-[#0a0a0a] text-sm font-medium hover:bg-white active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4a4a4a]">
          Authorized personnel only
        </p>
      </div>
    </section>
  );
};

export default AdminLogin;
