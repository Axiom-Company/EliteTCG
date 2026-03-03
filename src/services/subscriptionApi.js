import { ELITE_API_URL } from '@/config/api';

const API_BASE_URL = ELITE_API_URL;

export const subscriptionApi = {
  async getPlans() {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch plans');
    return json;
  },

  async getMySubscription(token) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch subscription');
    return json;
  },

  async subscribe(token, planId) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan_id: planId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to subscribe');
    return json;
  },

  async cancelSubscription(token) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to cancel subscription');
    return json;
  },

  async getSubscriptionHistory(token) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch history');
    return json;
  }
};
