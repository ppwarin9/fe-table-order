import { defineConfig, devices } from '@playwright/test';

// Real browser-level smoke tests for the two flows that matter most (customer ordering,
// admin order queue) — not full multi-browser/CI-wired coverage. Both specs need a real
// backend reachable at NEXT_PUBLIC_API_BASE_URL (a dev or staging Railway instance, never
// production) plus the env vars documented at the top of each spec file. Run with:
//   pnpm test:e2e
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
