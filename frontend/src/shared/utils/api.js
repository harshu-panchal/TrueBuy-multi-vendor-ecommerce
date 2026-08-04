import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from './constants';

const AUTH_SCOPES = {
  admin: {
    prefix: '/admin',
    accessKey: 'adminToken',
    refreshKey: 'adminRefreshToken',
    persistKey: 'admin-auth-storage',
    loginPath: '/admin/login',
    areaPrefix: '/admin',
  },
  vendor: {
    prefix: '/vendor',
    accessKey: 'vendor-token',
    refreshKey: 'vendor-refresh-token',
    persistKey: 'vendor-auth-storage',
    loginPath: '/vendor/login',
    areaPrefix: '/vendor',
  },
  delivery: {
    prefix: '/delivery',
    accessKey: 'delivery-token',
    refreshKey: 'delivery-refresh-token',
    persistKey: 'delivery-auth-storage',
    loginPath: '/delivery/login',
    areaPrefix: '/delivery',
  },
  user: {
    prefix: '/user',
    accessKey: 'token',
    refreshKey: 'refresh-token',
    persistKey: 'auth-storage',
    loginPath: '/login',
    areaPrefix: '/',
  },
};

const EXCLUDED_AUTH_SUFFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/verify-reset-otp',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/logout',
];

const refreshInFlight = {
  admin: null,
  vendor: null,
  delivery: null,
  user: null,
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_REDIRECT_LOCK_KEY = 'auth-redirect-lock';
const AUTH_REDIRECT_LOCK_MS = 1500;

const redirectTo = (path) => {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const currentPath = window.location.pathname;
  const lockUntil = Number(sessionStorage.getItem(AUTH_REDIRECT_LOCK_KEY) || 0);

  if (currentPath === path) return;
  if (now < lockUntil) return;

  sessionStorage.setItem(AUTH_REDIRECT_LOCK_KEY, String(now + AUTH_REDIRECT_LOCK_MS));
  window.location.href = path;
};

const getScopeFromPath = (path = (typeof window !== 'undefined' ? window.location.pathname : '/')) => {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/vendor')) return 'vendor';
  if (path.startsWith('/delivery')) return 'delivery';
  return 'user';
};

const normalizeUrlPath = (url = '') => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed.split('?')[0];
    }
  }
  return trimmed.split('?')[0];
};

const getScopeFromUrl = (url = '', pathScope = getScopeFromPath()) => {
  const path = normalizeUrlPath(url);
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/vendor')) return 'vendor';
  // B2B marketplace APIs are vendor-only but live under /b2b
  if (path.startsWith('/b2b')) return 'vendor';
  if (path.startsWith('/delivery')) return 'delivery';

  // Exchange APIs live under /exchange and are role-scoped by endpoint/path context.
  if (path.startsWith('/exchange/admin')) return 'admin';
  if (path.startsWith('/exchange/vendor')) return 'vendor';
  if (path.startsWith('/exchange/my')) return 'user';
  if (path.startsWith('/exchange/')) return pathScope;

  return 'user';
};

const isExcludedAuthRequest = (scope, url = '') => {
  const { prefix } = AUTH_SCOPES[scope];
  return EXCLUDED_AUTH_SUFFIXES.some((suffix) => url.startsWith(`${prefix}${suffix}`));
};

const getStorageToken = (key) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const setStorageToken = (key, value, scope) => {
  if (typeof window === 'undefined') return;
  const config = AUTH_SCOPES[scope];
  const isSessionOnly = Boolean(sessionStorage.getItem(config?.accessKey || key));
  const targetStorage = isSessionOnly ? sessionStorage : localStorage;
  const otherStorage = isSessionOnly ? localStorage : sessionStorage;

  targetStorage.setItem(key, value);
  otherStorage.removeItem(key);
};

const clearScopeAuth = (scope) => {
  const config = AUTH_SCOPES[scope];
  if (typeof window === 'undefined' || !config) return;
  localStorage.removeItem(config.accessKey);
  localStorage.removeItem(config.refreshKey);
  localStorage.removeItem(config.persistKey);
  sessionStorage.removeItem(config.accessKey);
  sessionStorage.removeItem(config.refreshKey);
  sessionStorage.removeItem(config.persistKey);
};

const shouldAttemptRefresh = (error, scope) => {
  if (error?.response?.status !== 401) return false;
  if (!scope || !AUTH_SCOPES[scope]) return false;

  const refreshToken = getStorageToken(AUTH_SCOPES[scope].refreshKey);
  if (!refreshToken) return false;

  const originalRequest = error.config || {};
  if (originalRequest._retry) return false;

  const url = originalRequest.url || '';
  if (isExcludedAuthRequest(scope, url)) return false;

  return true;
};

const runRefresh = async (scope) => {
  if (refreshInFlight[scope]) {
    return refreshInFlight[scope];
  }

  const config = AUTH_SCOPES[scope];
  const currentRefreshToken = getStorageToken(config.refreshKey);
  if (!currentRefreshToken) {
    throw new Error('No refresh token available.');
  }

  refreshInFlight[scope] = axios
    .post(`${API_BASE_URL}${config.prefix}/auth/refresh`, {
      refreshToken: currentRefreshToken,
    })
    .then((response) => {
      const payload = response?.data?.data || response?.data || {};
      const nextAccessToken = payload?.accessToken;
      const nextRefreshToken = payload?.refreshToken;
      if (!nextAccessToken || !nextRefreshToken) {
        throw new Error('Invalid refresh response from server.');
      }

      setStorageToken(config.accessKey, nextAccessToken, scope);
      setStorageToken(config.refreshKey, nextRefreshToken, scope);

      return nextAccessToken;
    })
    .finally(() => {
      refreshInFlight[scope] = null;
    });

  return refreshInFlight[scope];
};

api.interceptors.request.use(
  (config) => {
    const pathScope = getScopeFromPath();
    const scope = getScopeFromUrl(config.url || '', pathScope);
    const token = getStorageToken(AUTH_SCOPES[scope].accessKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {};
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pathScope = getScopeFromPath(currentPath);
    const scope = getScopeFromUrl(originalRequest.url || '', pathScope);

    if (shouldAttemptRefresh(error, scope)) {
      try {
        const nextAccessToken = await runRefresh(scope);
        originalRequest._retry = true;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(originalRequest);
      } catch {
        // fallback to existing session-expired handling below
      }
    }

    // Extract the exact error message from the backend
    const backendMessage = error.response?.data?.message;
    
    // Prevent generic Axios messages from being shown to the user
    let message = backendMessage;
    if (!message) {
      message = error.message?.includes('status code') ? null : error.message;
    }
    
    // Only show toast if we have a meaningful message
    if (message) {
      toast.error(message);
    } else if (!error.response) {
      // Fallback for true network errors
      toast.error('Network error. Please try again.');
    }

    if (error.response?.status === 401) {
      const activeScope = pathScope;
      clearScopeAuth(scope);
      if (scope !== activeScope) {
        return Promise.reject(error);
      }

      const routeConfig = AUTH_SCOPES[scope];
      if (scope === 'user') {
        const isAuthPage =
          currentPath === '/login' ||
          currentPath === '/register' ||
          currentPath === '/verification' ||
          currentPath === '/forgot-password' ||
          currentPath === '/reset-password';
        if (!isAuthPage) {
          redirectTo(routeConfig.loginPath);
        }
      } else if (currentPath.startsWith(routeConfig.areaPrefix) && currentPath !== routeConfig.loginPath) {
        toast.error('Session expired. Please login again.');
        redirectTo(routeConfig.loginPath);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
