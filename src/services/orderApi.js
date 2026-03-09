import { PAYMENTS_API_URL } from '../config/api';

/**
 * Create an order via the payments microservice (direct checkout — no auth required).
 */
export async function createDirectOrder({ items, customer, shipping, payment_provider = 'payfast', turnstile_token }) {
  const res = await fetch(`${PAYMENTS_API_URL}/checkout/direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customer, shipping, payment_provider, turnstile_token }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to create order');
  }

  return res.json();
}

/**
 * Track an order by order number and email (guest-friendly).
 */
export async function trackOrder(orderNumber, email) {
  const params = new URLSearchParams({ email });
  const res = await fetch(`${PAYMENTS_API_URL}/orders/track/${orderNumber}?${params}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Order not found');
  }

  return res.json();
}

/**
 * Get authenticated user's orders.
 */
export async function getMyOrders(token, page = 1) {
  const res = await fetch(`${PAYMENTS_API_URL}/orders/my?page=${page}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to fetch orders');
  }

  return res.json();
}

/**
 * Get a single order detail for authenticated user.
 */
export async function getMyOrderDetail(token, orderNumber) {
  const res = await fetch(`${PAYMENTS_API_URL}/orders/my/${orderNumber}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Order not found');
  }

  return res.json();
}

/**
 * Seller: Get all orders (requires seller auth).
 */
export async function getSellerOrders(token, status = null, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);

  const res = await fetch(`${PAYMENTS_API_URL}/orders/manage?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to fetch orders');
  }

  return res.json();
}

/**
 * Seller: Update order status.
 */
export async function updateOrderStatus(token, orderId, status) {
  const res = await fetch(`${PAYMENTS_API_URL}/orders/manage/${orderId}/status?status=${status}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to update order');
  }

  return res.json();
}

/**
 * Seller: Book Courier Guy shipment for an order.
 */
export async function bookShipment(token, orderId) {
  const res = await fetch(`${PAYMENTS_API_URL}/shipping/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to book shipment');
  }

  return res.json();
}
