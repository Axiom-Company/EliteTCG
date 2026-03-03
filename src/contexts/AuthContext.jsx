import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { ELITE_API_URL } from '@/config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${ELITE_API_URL}/api/customer/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.customer || data.user || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.access_token) {
        const profile = await fetchProfile(s.access_token);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.access_token) {
        const profile = await fetchProfile(s.access_token);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Auth not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    // Register via API first (creates customer record)
    const res = await fetch(`${ELITE_API_URL}/api/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...metadata }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');

    // Then sign in
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }
    return result;
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Auth not configured');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const getToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  }, []);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isSeller: !!user?.is_seller,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
