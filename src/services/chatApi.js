import { ELITE_API_URL } from '../config/api';

const CHAT_URL = `${ELITE_API_URL}/api/community/chat`;

async function request(path, token, options = {}) {
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${CHAT_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.detail || 'Request failed');
  }
  return res.json();
}

// ── Channel config ──

export function getChannels(token) {
  return request('/channels', token);
}

export function getChannelPinned(slug, token) {
  return request(`/channels/${slug}/pinned`, token);
}

export function getChannelMembers(slug, token) {
  return request(`/channels/${slug}/members`, token);
}

// ── DMs ──

export function getDMList(token) {
  return request('/dm', token);
}

export function getOrCreateDM(token, userId) {
  return request('/dm', token, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export function getDMMessages(token, channelId, { limit = 50, before } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  return request(`/dm/${channelId}/messages?${params}`, token);
}

export function sendDMMessage(token, channelId, content, replyToId = null) {
  return request(`/dm/${channelId}/messages`, token, {
    method: 'POST',
    body: JSON.stringify({ content, reply_to_id: replyToId }),
  });
}

export function editDMMessage(token, channelId, messageId, content) {
  return request(`/dm/${channelId}/messages/${messageId}`, token, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export function deleteDMMessage(token, channelId, messageId) {
  return request(`/dm/${channelId}/messages/${messageId}`, token, {
    method: 'DELETE',
  });
}

export function uploadDMImage(token, channelId, file) {
  const formData = new FormData();
  formData.append('image', file);
  return request(`/dm/${channelId}/upload`, token, {
    method: 'POST',
    body: formData,
  });
}

// ── Moderation ──

export function muteUser(token, slug, userId, duration = null) {
  return request(`/channels/${slug}/mute/${userId}`, token, {
    method: 'POST',
    body: JSON.stringify({ duration }),
  });
}

export function unmuteUser(token, slug, userId) {
  return request(`/channels/${slug}/unmute/${userId}`, token, { method: 'POST' });
}

export function banUser(token, slug, userId, reason = '') {
  return request(`/channels/${slug}/ban/${userId}`, token, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function unbanUser(token, slug, userId) {
  return request(`/channels/${slug}/unban/${userId}`, token, { method: 'POST' });
}
