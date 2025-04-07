const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchDeals(params = {}) {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${API_URL}/api/deals?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch deals');
  return response.json();
}

export async function fetchSources() {
  const response = await fetch(`${API_URL}/api/sources`);
  if (!response.ok) throw new Error('Failed to fetch sources');
  return response.json();
}

export async function fetchThemes() {
  const response = await fetch(`${API_URL}/api/themes`);
  if (!response.ok) throw new Error('Failed to fetch themes');
  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_URL}/api/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function refreshDeals() {
  const response = await fetch(`${API_URL}/api/refresh`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to refresh deals');
  return response.json();
} 