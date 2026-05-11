// Native fetch client — base URL config, error class, request function, and api helpers

import { logNetworkError } from '../error-logger';
import { useAuthStore } from '@/store/useAuthStore';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      useAuthStore.getState().setToken(data.token);
      return data.token;
    } catch { return null; }
    finally { refreshPromise = null; }
  })();
  return refreshPromise;
}

export class FetchClientError extends Error {
  response?: { status: number; data: Record<string, unknown> };
  config?: { url: string };

  constructor(message: string, status: number, data: Record<string, unknown>, url: string) {
    super(message);
    this.name = 'FetchClientError';
    this.response = { status, data };
    this.config = { url };
  }
}

export async function request<T>(method: string, url: string, body?: unknown, params?: Record<string, string>): Promise<{ data: T }> {
  let fullUrl = `${BASE_URL}${url}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) fullUrl += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  let data: Record<string, unknown> = {};
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await res.json();
  }

  if (!res.ok) {
    const errorMsg = (data?.message as string) || (data?.error as string) || res.statusText;

    // Log network errors (skip error-log endpoint to avoid loops)
    if (!url.includes('error-log')) {
      logNetworkError(url, res.status, errorMsg);
    }

    // Auto-logout on expired/invalid token, except for auth endpoints themselves
    if (res.status === 401 && !url.includes('/auth/')) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        // Retry original request with new token
        return request(method, url, body, params);
      }
      // Refresh failed — logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    throw new FetchClientError(errorMsg, res.status, data, url);
  }

  return { data: data as T };
}

export const api = {
  get: <T = any>(url: string, config?: { params?: Record<string, unknown> }) =>
    request<T>('GET', url, undefined, config?.params as Record<string, string> | undefined),

  post: <T = any>(url: string, body?: unknown) =>
    request<T>('POST', url, body),

  put: <T = any>(url: string, body?: unknown) =>
    request<T>('PUT', url, body),

  delete: <T = any>(url: string, config?: { params?: Record<string, unknown> }) =>
    request<T>('DELETE', url, undefined, config?.params as Record<string, string> | undefined),
};

export default api;
