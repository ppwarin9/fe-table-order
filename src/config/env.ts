import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXT_PUBLIC_LIFF_ID: z.string().min(1),
    NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  },
  server: {
    AUTH_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },
});

export const isLiffConfigured = () => {
  return (
    typeof env.NEXT_PUBLIC_LIFF_ID === 'string' &&
    env.NEXT_PUBLIC_LIFF_ID.trim().length > 0
  );
};
