const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}