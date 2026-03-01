import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/config/supabase';
import { ELITE_API_URL } from '@/config/api';

const API_BASE = `${ELITE_API_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify admin role via Express backend
  const verifyAdmin = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!res.ok) return null;

      const { user: adminUser } = await res.json();
      return adminUser;
    } catch {
      return null;
    }
  }, []);

  // Initialize: check existing session
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.access_token) {
        const adminUser = await verifyAdmin(currentSession.access_token);
        if (adminUser) {
          setUser(adminUser);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.access_token) {
            const adminUser = await verifyAdmin(newSession.access_token);
            if (adminUser) {
              setUser(adminUser);
            } else {
              setUser(null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [verifyAdmin]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Auth service not available');

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw new Error(authError.message);

      // Verify this user is an admin
      const adminUser = await verifyAdmin(authData.session.access_token);

      if (!adminUser) {
        // Not an admin — sign them out
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      setSession(authData.session);
      setUser(adminUser);
      return adminUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getToken,
    isAuthenticated: !!user && !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
