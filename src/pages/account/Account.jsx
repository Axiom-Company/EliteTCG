import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO/SEO';

/* ─── Skeleton ─────────────────────────────────────────────── */

const AccountSkeleton = () => (
  <div className="animate-pulse space-y-10">
    <div>
      <div className="h-7 bg-gray-100 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-56" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-14 bg-gray-50 rounded-xl" />
      ))}
    </div>
  </div>
);

/* ─── Main ─────────────────────────────────────────────────── */

const Account = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (searchParams.get('shipped') === '1') toast.success('Shipping payment successful!');
  }, [searchParams]);

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null;
  const email = session?.user?.email || user?.email;

  return (
    <div className="min-h-screen bg-white">
      <SEO title="My Account" description="Manage your account." path="/account" noindex />

      <div className="max-w-3xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">Account</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {(authLoading || (isAuthenticated && !user)) ? (
          <AccountSkeleton />
        ) : (
          <div className="space-y-10">
            {/* ── Header ── */}
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-1">
                {displayName ? `Hi, ${displayName}` : 'My Account'}
              </h1>
              <p className="text-sm text-gray-400">{email}</p>
            </div>

            {/* ── Navigation ── */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Account</p>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                <Link to="/orders" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">Order History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
                <Link to="/orders/track" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">Track an Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
                <Link to="/wishlist" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                    <span className="text-sm text-gray-900">Wishlist</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              </div>
            </div>

            {/* ── Need help ── */}
            <div className="border-t border-gray-100 pt-8 text-center">
              <p className="text-sm text-gray-400 mb-2">Need help?</p>
              <a
                href="mailto:admin@elitetcg.co.za"
                className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
