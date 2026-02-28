import { PAYMENTS_API_URL } from '../config/api';

/**
 * Get a live shipping quote from Courier Guy via the payments microservice.
 * @param {{ address_line1: string, city: string, province: string, postal_code: string, total_weight_grams?: number }} params
 * @returns {Promise<{ courier_cost_zar: number, customer_cost_zar: number, handling_fee_zar: number, estimated_days: number, service_name: string }>}
 */
export async function getShippingQuote({ address_line1, city, province, postal_code, total_weight_grams }) {
  const res = await fetch(`${PAYMENTS_API_URL}/shipping/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address_line1,
      city,
      province,
      postal_code,
      total_weight_grams: total_weight_grams || null,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to get shipping quote');
  }

  return res.json();
}
