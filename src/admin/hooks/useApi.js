import { useState, useCallback } from 'react';
import { ELITE_API_URL, PAYMENTS_API_URL } from '@/config/api';
import { supabase } from '@/config/supabase';

const API_BASE = `${ELITE_API_URL}/api`;
const FASTAPI_BASE = PAYMENTS_API_URL;
// Get token from Supabase session (same auth as public site)
const getToken = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = await getToken();

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
  me: () => apiFetch('/auth/me'),
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

// Banners API
export const bannersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/banners${query ? `?${query}` : ''}`);
  },
  create: (data) => apiFetch('/banners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/banners/${id}`, { method: 'DELETE' }),
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
    const token = await getToken();
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
  uploadImages: async (files) => {
    const token = await getToken();
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch(`${API_BASE}/upload/images`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.images.map(img => img.url);
  },
  deleteImage: (filename) => apiFetch(`/upload/${filename}`, { method: 'DELETE' }),
};

// ── FastAPI fetch wrapper (CourierGuy / PayFast backend, API-key auth) ──

const fastApiFetch = async (endpoint, options = {}) => {
  const token = await getToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${FASTAPI_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Dashboard API (FastAPI backend)
export const dashboardApi = {
  getStats: () => fastApiFetch('/dashboard/admin'),
};

// Orders API (FastAPI backend)
export const ordersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fastApiFetch(`/orders/admin${query ? `?${query}` : ''}`);
  },
  get: (id) => fastApiFetch(`/orders/admin/${id}`),
  updateStatus: (id, status) =>
    fastApiFetch(`/orders/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  addTracking: (id, trackingNumber) =>
    fastApiFetch(`/orders/admin/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ tracking_number: trackingNumber }),
    }),
  updateNotes: (id, notes) =>
    fastApiFetch(`/orders/admin/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),
  bookCourier: (orderId) =>
    fastApiFetch('/shipping/admin/book', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),
};

// Product Reviews API
export const productReviewsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/product-reviews${query ? `?${query}` : ''}`);
  },
  delete: (id) => apiFetch(`/product-reviews/${id}`, { method: 'DELETE' }),
};

// Email Admin API (FastAPI backend — webhook events + email logs)
export const emailAdminApi = {
  getStats: () => fastApiFetch('/email-webhooks/admin/stats'),
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fastApiFetch(`/email-webhooks/admin/logs${query ? `?${query}` : ''}`);
  },
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fastApiFetch(`/email-webhooks/admin/events${query ? `?${query}` : ''}`);
  },
};

// Webhook Admin API (FastAPI backend)
export const webhookApi = {
  getAll: () => fastApiFetch('/admin/webhooks'),
  create: (data) => fastApiFetch('/admin/webhooks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fastApiFetch(`/admin/webhooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id) => {
    const token = await getToken();
    const response = await fetch(`${FASTAPI_BASE}/admin/webhooks/${id}`, {
      method: 'DELETE',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || 'Delete failed');
    }
  },
  test: (id) => fastApiFetch(`/admin/webhooks/${id}/test`, { method: 'POST' }),
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

export default { productsApi, setsApi, categoriesApi, configApi, preordersApi, discountsApi, ordersApi, dashboardApi, emailAdminApi, webhookApi };
