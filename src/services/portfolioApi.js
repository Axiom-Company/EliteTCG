import { ELITE_API_URL } from '../config/api';

const BASE = `${ELITE_API_URL}/api/portfolio`;

const authHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ── Portfolio CRUD ──────────────────────────────────────────

export async function getPortfolio(token, params = {}) {
  const qs = new URLSearchParams();
  if (params.sort) qs.set('sort', params.sort);
  if (params.order) qs.set('order', params.order);
  if (params.set) qs.set('set', params.set);
  if (params.rarity) qs.set('rarity', params.rarity);
  const url = `${BASE}${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function addToPortfolio(token, data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add card');
  return res.json();
}

export async function updatePortfolioCard(token, entryId, data) {
  const res = await fetch(`${BASE}/${entryId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update card');
  return res.json();
}

export async function removeFromPortfolio(token, entryId) {
  const res = await fetch(`${BASE}/${entryId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to remove card');
  return res.json();
}

// ── Search ──────────────────────────────────────────────────

export async function searchCards(token, query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

// ── Analytics ───────────────────────────────────────────────

export async function getPortfolioSummary(token) {
  const res = await fetch(`${BASE}/summary`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function getPortfolioHistory(token) {
  const res = await fetch(`${BASE}/history`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

// ── Set Completion ──────────────────────────────────────────

export async function getSetCompletion(token) {
  const res = await fetch(`${BASE}/completion`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch completion');
  return res.json();
}

export async function getSetGaps(token, setId) {
  const res = await fetch(`${BASE}/gaps?set=${encodeURIComponent(setId)}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch gap analysis');
  return res.json();
}
