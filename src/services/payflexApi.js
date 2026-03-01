import { PAYMENTS_API_URL } from '../config/api';

/**
 * Fetch Payflex configuration (min/max amounts, availability).
 */
export async function getPayflexConfiguration() {
  try {
    const res = await fetch(`${PAYMENTS_API_URL}/payments/payflex/configuration`);
    if (!res.ok) return { available: false, min_amount: '0', max_amount: '0' };
    return res.json();
  } catch {
    return { available: false, min_amount: '0', max_amount: '0' };
  }
}

/**
 * Create a Payflex order and get the redirect URL.
 * @param {string} orderNumber - Our internal order number (e.g. "PKM-00042")
 */
export async function createPayflexOrder(orderNumber) {
  const res = await fetch(`${PAYMENTS_API_URL}/payments/payflex/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderNumber }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_message || data.detail || 'Failed to create Payflex order');
  }
  return data;
}

/**
 * Get order status from our backend (for return page verification).
 * @param {string} orderNumber - Our order number
 */
export async function getPayflexOrderStatus(orderNumber) {
  const res = await fetch(`${PAYMENTS_API_URL}/payments/payflex/order/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to fetch order status');
  }
  return res.json();
}

/**
 * Get order status from the Payflex return endpoint (verifies with Payflex API).
 * @param {string} orderNumber - Our order number
 * @param {string} token - Payflex token from URL params
 */
export async function verifyPayflexReturn(orderNumber, token) {
  const params = new URLSearchParams();
  if (orderNumber) params.set('order', orderNumber);
  if (token) params.set('token', token);

  const res = await fetch(`${PAYMENTS_API_URL}/payments/payflex/return?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to verify payment status');
  }
  return res.json();
}
