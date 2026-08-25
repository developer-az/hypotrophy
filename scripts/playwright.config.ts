import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: '.',
  testMatch: 'preview.spec.ts',
  fullyParallel: false,
  retries: 0,
  use: { baseURL, viewport: { width: 1440, height: 900 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
