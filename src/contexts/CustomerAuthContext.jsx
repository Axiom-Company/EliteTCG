import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ELITE_API_URL } from '@/config/api';

const API_BASE_URL = ELITE_API_URL;

const CustomerAuthContext = createContext(null);

// API helper
const customerApi = {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const savedUser = localStorage.getItem('customer_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await customerApi.register(data);
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await customerApi.login(email, password);
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const token = localStorage.getItem('customer_token');
    if (!token) throw new Error('Not authenticated');

    try {
      const { user } = await customerApi.updateProfile(token, data);
      localStorage.setItem('customer_user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const token = localStorage.getItem('customer_token');
    if (!token) throw new Error('Not authenticated');

    try {
      await customerApi.changePassword(token, currentPassword, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) return;

    try {
      const { user } = await customerApi.getProfile(token);
      localStorage.setItem('customer_user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      // Token might be invalid
      logout();
    }
  }, [logout]);

  const getToken = useCallback(() => {
    return localStorage.getItem('customer_token');
  }, []);

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
    isAuthenticated: !!user,
    isSeller: user?.is_seller || false,
    sellerId: user?.seller_id || null
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

export { customerApi };
export default useCustomerAuth;
