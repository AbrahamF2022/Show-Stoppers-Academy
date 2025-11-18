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
    // Production API URL - UPDATE THIS with your deployed backend URL
    // Deploy your backend to: Render, Railway, Fly.io, or your own server
    // Then update the URL below (e.g., 'https://ssa-tutoring-api.onrender.com/api')
    // 
    // For now, this points to a placeholder - you must deploy the backend and update this
    const hostname = window.location.hostname;
    
    // If using GitHub Pages with custom domain (showstoppersacademy.org)
    if (hostname === 'showstoppersacademy.org' || hostname.includes('showstoppersacademy')) {
      return 'https://api.showstoppersacademy.org/api'; // Update with your backend URL
    }
    
    // If using GitHub Pages default domain (username.github.io)
    if (hostname.includes('github.io')) {
      // Default: use a Render/Railway backend URL - UPDATE THIS
      return 'https://ssa-tutoring-api.onrender.com/api'; // Update with your backend URL
    }
    
    // Fallback for any other HTTPS domain
    return 'https://api.showstoppersacademy.org/api'; // Update with your backend URL
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
