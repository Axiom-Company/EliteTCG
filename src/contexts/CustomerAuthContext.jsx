import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/config/supabase';
import { ELITE_API_URL } from '@/config/api';

const API_BASE_URL = ELITE_API_URL;

const CustomerAuthContext = createContext(null);

// API helper for profile operations (still goes through Express)
const profileApi = {
  async register(data) {
    const res = await fetch(`${API_BASE_URL}/api/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async getProfile(token) {
    const res = await fetch(`${API_BASE_URL}/api/customer/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to get profile');
    return json;
  },

  async updateProfile(token, data) {
    const res = await fetch(`${API_BASE_URL}/api/customer/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  }
};

export const CustomerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer profile from backend using Supabase token
  const fetchProfile = useCallback(async (accessToken) => {
    try {
      const { user: profile } = await profileApi.getProfile(accessToken);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setUser(null);
      return null;
    }
  }, []);

  // Initialize: check existing session and listen for auth changes
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.access_token) {
        fetchProfile(currentSession.access_token).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.access_token) {
            await fetchProfile(newSession.access_token);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Auth service not available');

      // Server-side registration (creates Supabase Auth user + customer profile)
      const result = await profileApi.register(data);

      // Sign in after registration
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        // Registration succeeded but auto-login failed (e.g. email confirmation required)
        return result.user;
      }

      setSession(authData.session);
      if (authData.session?.access_token) {
        await fetchProfile(authData.session.access_token);
      }

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

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

      setSession(authData.session);
      const profile = await fetchProfile(authData.session.access_token);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const token = session?.access_token;
    if (!token) throw new Error('Not authenticated');

    try {
      const { user: updatedUser } = await profileApi.updateProfile(token, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [session]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!supabase) throw new Error('Auth service not available');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw new Error(updateError.message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;

    try {
      await fetchProfile(token);
    } catch (err) {
      await logout();
    }
  }, [session, fetchProfile, logout]);

  const getToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    getToken,
    isAuthenticated: !!user && !!session,
    isSeller: user?.is_seller || false,
    sellerId: user?.seller_profile?.id || user?.seller_id || null
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

export default useCustomerAuth;
