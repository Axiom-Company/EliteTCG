import { PAYMENTS_API_URL } from '../config/api';

/**
 * Card Evaluation API client — connects to CourierGuy_PayFast card evaluation endpoints.
 */

/**
 * Search cards by name with optional set filter.
 * @param {string} query - Card name search term
 * @param {string} [setId] - Optional set ID to filter by
 * @returns {Promise<{ cards: Array, total: number }>}
 */
export async function searchCards(query, setId) {
  const params = new URLSearchParams({ q: query });
  if (setId) params.append('set_id', setId);

  const res = await fetch(`${PAYMENTS_API_URL}/cards/search?${params}`);
  if (!res.ok) throw new Error('Card search failed');
  return res.json();
}

/**
 * Lookup a specific card by set and number.
 * @param {string} setId - Set ID (e.g. "base1")
 * @param {string} number - Card number within set
 * @returns {Promise<Object>} Card data with price info
 */
export async function lookupCard(setId, number) {
  const res = await fetch(`${PAYMENTS_API_URL}/cards/lookup/${setId}/${number}`);
  if (!res.ok) throw new Error('Card lookup failed');
  return res.json();
}

/**
 * Evaluate a card with condition-based pricing.
 * @param {string} setId - Set ID
 * @param {string} number - Card number
 * @param {string} condition - Condition (NM, LP, MP, HP, D)
 * @returns {Promise<Object>} Evaluation with market price, suggested price, etc.
 */
export async function evaluateCard(setId, number, condition) {
  const res = await fetch(`${PAYMENTS_API_URL}/cards/evaluate/${setId}/${number}?condition=${condition}`);
  if (!res.ok) throw new Error('Card evaluation failed');
  return res.json();
}

/**
 * Scan a card image for recognition.
 * @param {string} imageBase64 - Base64-encoded image data
 * @returns {Promise<Object>} Matched card results
 */
export async function scanCard(imageBase64) {
  const res = await fetch(`${PAYMENTS_API_URL}/cards/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 })
  });
  if (!res.ok) throw new Error('Card scan failed');
  return res.json();
}

/**
 * Get current USD to ZAR exchange rate.
 * @returns {Promise<{ rate: number, source: string, cached: boolean }>}
 */
export async function getExchangeRate() {
  const res = await fetch(`${PAYMENTS_API_URL}/cards/exchange-rate`);
  if (!res.ok) throw new Error('Failed to get exchange rate');
  return res.json();
}

/**
 * Preview commission breakdown for a given ZAR price.
 * @param {number} priceZar - Price in ZAR
 * @returns {Promise<{ price: number, commission_rate: number, commission_amount: number, seller_receives: number }>}
 */
export async function previewCommission(priceZar) {
  const res = await fetch(`${PAYMENTS_API_URL}/cards/commission-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price_zar: priceZar })
  });
  if (!res.ok) throw new Error('Commission preview failed');
  return res.json();
}

// Condition mapping: our listing conditions → API condition codes
export const conditionToApiCode = {
  mint: 'NM',
  near_mint: 'NM',
  excellent: 'LP',
  good: 'MP',
  played: 'HP',
  poor: 'D'
};
