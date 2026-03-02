import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ELITE_API_URL } from '../config/api';

const API_BASE_URL = ELITE_API_URL;
const TOKEN_KEY = 'elitetcg_auth_token';

const CustomerAuthContext = createContext(null);

// API helper for authentication and profile operations
const authApi = {
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

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/customer/login`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
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
  },

  async changePassword(token, currentPassword, newPassword) {
    const res = await fetch(`${API_BASE_URL}/api/customer/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to change password');
    return json;
  }
};

export const CustomerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer profile using stored token
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const { user: profile } = await authApi.getProfile(authToken);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setUser(null);
      // Clear invalid token
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      return null;
    }
  }, []);

  // Initialize: check for stored token and fetch profile
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Server-side registration
      const result = await authApi.register(data);
      
      // Attempt auto-login after registration
      try {
        const loginResult = await authApi.login(data.email, data.password);
        const authToken = loginResult.token;
        
        // Store token and set session
        localStorage.setItem(TOKEN_KEY, authToken);
        setToken(authToken);
        
        // Fetch and set user profile
        await fetchProfile(authToken);
        
        return result.user;
      } catch (loginErr) {
        // Registration succeeded but auto-login failed
        console.warn('Auto-login after registration failed:', loginErr.message);
        return result.user;
      }
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
      const result = await authApi.login(email, password);
      const authToken = result.token;
      
      // Store token
      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
      
      // Fetch and set user profile
      const profile = await fetchProfile(authToken);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    // Clear stored data
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const { user: updatedUser } = await authApi.updateProfile(token, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');

    try {
      await authApi.changePassword(token, currentPassword, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  // Note: Google OAuth would need to be implemented in the backend API
  const loginWithGoogle = useCallback(() => {
    throw new Error('Google OAuth not implemented in API-only mode');
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    updateProfile,
    changePassword,
    clearError: () => setError(null)
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
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
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
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    getToken,
    isAuthenticated: !!user && !!session,
    isSeller: ['seller', 'verified_seller', 'admin'].includes(user?.role),
    isVerifiedSeller: ['verified_seller', 'admin'].includes(user?.role),
    isAdmin: user?.role === 'admin',
    role: user?.role || null,
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
