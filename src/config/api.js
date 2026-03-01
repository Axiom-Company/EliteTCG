// API Base URLs — configurable per environment via Vite env vars
// Local dev: Express on 3001, FastAPI on 8000
// Production: Express on same domain, FastAPI on Railway

export const ELITE_API_URL = import.meta.env.VITE_ELITE_API_URL || 'http://localhost:3001';
export const PAYMENTS_API_URL = import.meta.env.VITE_PAYMENTS_API_URL || 'http://localhost:8000/api/v1';

// Placeholder for missing / broken product images
export const PLACEHOLDER_IMAGE = `${ELITE_API_URL}/uploads/item_not_found.webp`;

// Helper for Elite TCG backend image URLs
export const getImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  return `${ELITE_API_URL}${url}`;
};
