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
    // A 401 from the join call itself means the idToken was invalid/expired — that's
    // not "this table session got closed" (there's no session yet to clear), so the
    // join page handles that case itself with a LINE re-login prompt instead of being
    // redirected here.
    const isJoinRequest = typeof error?.config?.url === 'string' && error.config.url.includes('/table-sessions/join');
    if (appError.status === 401 && !isJoinRequest) {
      useSessionStore.getState().clear();
      if (typeof window !== 'undefined') {
        window.location.assign('/closed');
      }
    }
    return Promise.reject(appError);
  },
);
