import { AxiosError } from 'axios';

export interface AppError {
  status: number;
  message: string;
  path?: string;
  timestamp?: string;
  isNetworkError: boolean;
  raw?: unknown;
}

interface BackendErrorBody {
  statusCode?: number;
  message?: string | string[];
  path?: string;
  timestamp?: string;
}

export function normalizeAxiosError(error: unknown): AppError {
  if (!(error instanceof AxiosError)) {
    return {
      status: 0,
      message: 'Unexpected error',
      isNetworkError: false,
      raw: error,
    };
  }

  if (!error.response) {
    return {
      status: 0,
      message: 'Cannot reach the server. Check your connection and try again.',
      isNetworkError: true,
      raw: error,
    };
  }

  const body = error.response.data as BackendErrorBody | undefined;
  const message = Array.isArray(body?.message)
    ? body.message.join(', ')
    : (body?.message ?? error.message);

  return {
    status: error.response.status,
    message,
    path: body?.path,
    timestamp: body?.timestamp,
    isNetworkError: false,
    raw: error,
  };
}
