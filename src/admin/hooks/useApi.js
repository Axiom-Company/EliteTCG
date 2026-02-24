import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Products API
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/products/${id}`),
  create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  updateInventory: (id, data) => apiFetch(`/products/${id}/inventory`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Sets API
export const setsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/sets${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/sets/${id}`),
  create: (data) => apiFetch('/sets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/sets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/sets/${id}`, { method: 'DELETE' }),
  reorder: (orders) => apiFetch('/sets/reorder', { method: 'POST', body: JSON.stringify({ orders }) }),
};

// Categories API
export const categoriesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/categories${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/categories/${id}`),
  create: (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
  reorder: (orders) => apiFetch('/categories/reorder', { method: 'POST', body: JSON.stringify({ orders }) }),
};

// Config API
export const configApi = {
  getAll: () => apiFetch('/config'),
  get: (key) => apiFetch(`/config/${key}`),
  update: (key, value, isActive) => apiFetch(`/config/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value, is_active: isActive })
  }),
  bulkUpdate: (updates) => apiFetch('/config', { method: 'PUT', body: JSON.stringify(updates) }),
};

// Preorders API
export const preordersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/preorders${query ? `?${query}` : ''}`);
  },
  get: (id) => apiFetch(`/preorders/${id}`),
  create: (data) => apiFetch('/preorders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/preorders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/preorders/${id}`, { method: 'DELETE' }),
};

// Discounts API
export const discountsApi = {
  getAll: () => apiFetch('/discounts'),
  validate: (code, orderTotal) => apiFetch('/discounts/validate', {
    method: 'POST',
    body: JSON.stringify({ code, order_total: orderTotal })
  }),
  create: (data) => apiFetch('/discounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/discounts/${id}`, { method: 'DELETE' }),
};

// Upload API
export const uploadApi = {
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
  deleteImage: (filename) => apiFetch(`/upload/${filename}`, { method: 'DELETE' }),
};

// Custom hook for API calls with loading/error state
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
};

export default { authApi, productsApi, setsApi, categoriesApi, configApi, preordersApi, discountsApi };
