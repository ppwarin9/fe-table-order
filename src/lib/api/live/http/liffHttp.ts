import { env } from '@/config/env';
import { normalizeAxiosError } from '@/lib/api/live/http/normalizeError';
import { useSessionStore } from '@/stores/sessionStore';
import axios from 'axios';

export const liffHttp = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
});

liffHttp.interceptors.request.use((config) => {
  const token = useSessionStore.getState().sessionToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

liffHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = normalizeAxiosError(error);
    if (appError.status === 401) {
      useSessionStore.getState().clear();
      if (typeof window !== 'undefined') {
        window.location.assign('/closed');
      }
    }
    return Promise.reject(appError);
  },
);
