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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 rounded-full animate-spin border-gray-200 border-t-gray-500" />
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
