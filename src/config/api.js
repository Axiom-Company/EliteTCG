// API Base URLs — configurable per environment via Vite env vars
// Local dev: Express on 3001, FastAPI on 8000
// Production: Express on its host, FastAPI on Render

export const ELITE_API_URL = import.meta.env.VITE_ELITE_API_URL || 'http://localhost:3001';
export const PAYMENTS_API_URL = import.meta.env.VITE_PAYMENTS_API_URL || 'http://localhost:8000/api/v1';

// Helper for Elite TCG backend image URLs
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ELITE_API_URL}${url}`;
};
