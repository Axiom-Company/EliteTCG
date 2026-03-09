import { ELITE_API_URL } from '../config/api';

const PAYFLEX_BASE = `${ELITE_API_URL}/api/payflex`;

/**
 * Fetch Payflex configuration (min/max amounts, availability).
 */
export async function getPayflexConfiguration() {
  try {
    const res = await fetch(`${PAYFLEX_BASE}/configuration`);
    if (!res.ok) return { available: false, min_amount: '0', max_amount: '0' };
    const data = await res.json();
    return { available: true, ...data };
  } catch {
    return { available: false, min_amount: '0', max_amount: '0' };
  }
}

/**
 * Create a Payflex order and get the redirect URL.
 */
export async function createPayflexOrder(orderId) {
  const res = await fetch(`${PAYFLEX_BASE}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_message || data.detail || 'Failed to create Payflex order');
  }
  return data;
}

/**
 * Get order status from our backend.
 */
export async function getPayflexOrderStatus(orderNumber) {
  const res = await fetch(`${PAYFLEX_BASE}/order/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to fetch order status');
  }
  return res.json();
}
