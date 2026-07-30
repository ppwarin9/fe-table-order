import { env } from '@/config/env';
import { normalizeAxiosError } from '@/lib/api/live/http/normalizeError';
import {
  getAdminAccessToken,
  getAdminUnauthorizedHandler,
} from '@/lib/api/live/http/tokenRef';
import axios from 'axios';

export const adminHttp = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
});

adminHttp.interceptors.request.use((config) => {
  const token = getAdminAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = normalizeAxiosError(error);

    if (appError.status === 401 && getAdminAccessToken()) {
      getAdminUnauthorizedHandler()?.();
    }

    return Promise.reject(appError);
  },
);
