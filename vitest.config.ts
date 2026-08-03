import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['node_modules', '.next', 'e2e'],
    env: {
      // @/config/env.ts validates these at import time (createEnv) — without them,
      // any test that transitively imports it (e.g. via useRealtimeChannel) throws
      // immediately, since there's no .env.local loaded the way Next.js loads one.
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:9999/api/v1',
      NEXT_PUBLIC_LIFF_ID: 'test-liff-id',
      AUTH_SECRET: 'test-auth-secret',
    },
  },
});
