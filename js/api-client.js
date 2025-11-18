// Auto-detect production vs development
function getApiBase() {
  // If explicitly set, use that
  if (window.__SSA_API_BASE__) {
    return window.__SSA_API_BASE__;
  }
  
  // Check localStorage for saved API base
  const saved = localStorage.getItem('ssaApiBase');
  if (saved) {
    return saved;
  }
  
  // Auto-detect: if running on HTTPS (production), use production API
  if (window.location.protocol === 'https:') {
    // Production Railway backend URL
    return 'https://show-stoppers-academy-production.up.railway.app/api';
  }
  
  // Development: use localhost
  return 'http://localhost:4000/api';
}

const API_BASE = getApiBase();
const TOKEN_KEY = 'ssaAuthToken';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch (_) {
      // ignore JSON parsing errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getCurrentUser() {
  return apiFetch('/auth/me');
}

export function logout() {
  setToken(null);
}
