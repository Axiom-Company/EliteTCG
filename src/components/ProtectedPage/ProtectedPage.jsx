import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ELITE_API_URL } from '../../config/api';
import { Lock } from 'lucide-react';

const ProtectedPage = ({ pagePath, children }) => {
  const { isAuthenticated, getToken, loading: authLoading } = useAuth();
  const [access, setAccess] = useState(null); // null = loading, true/false = result
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        setAccess(false);
        setChecking(false);
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch(
          `${ELITE_API_URL}/api/page-access/check?page=${encodeURIComponent(pagePath)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAccess(data.allowed);
      } catch {
        setAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, authLoading, getToken, pagePath]);

  if (authLoading || checking) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-1.5 mb-6">
          <div className="h-3 w-10 bg-gray-100 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-100 rounded mb-3" />
          <div className="h-3 w-full max-w-2xl bg-gray-100 rounded mb-2" />
          <div className="h-3 w-3/4 max-w-xl bg-gray-100 rounded" />
        </div>
        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 flex-1 max-w-sm bg-gray-100 rounded" />
          <div className="h-10 w-32 bg-gray-100 rounded hidden sm:block" />
          <div className="h-10 w-32 bg-gray-100 rounded hidden sm:block" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-white overflow-hidden">
              <div className="aspect-square bg-gray-100" />
              <div className="p-2 md:p-5 flex flex-col gap-2.5">
                <div className="h-2.5 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-2.5 w-14 bg-gray-100 rounded" />
                <div className="h-5 w-20 bg-gray-100 rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Sign in required</h2>
          <p className="text-sm text-gray-500 mb-6">You need to be signed in to access this page.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Access restricted</h2>
          <p className="text-sm text-gray-500 mb-6">You don't have permission to view this page.</p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedPage;
