import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
});

const TOKEN_KEY = 'cw_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend error messages.
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Request failed'
    );
  }
  return 'Unexpected error';
}
