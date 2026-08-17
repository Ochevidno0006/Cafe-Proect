const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function fetchMenu(slug) {
  const res = await fetch(`${API_BASE}/api/public/menu/${slug}`);
  if (!res.ok) throw new Error('menu_not_found');
  const data = await res.json();
  return data.menu;
}

export function recordEvent(slug, eventType, entityId) {
  fetch(`${API_BASE}/api/public/menu/${slug}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, entityId }),
  }).catch(() => {});
}

export function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}
