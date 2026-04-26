import { defineConfig, devices } from '@playwright/test';

const isDemo = process.env.PLAYWRIGHT_DEMO === 'true';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isDemo,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: isDemo ? 1 : (process.env.CI ? 1 : undefined),
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    headless: !isDemo,
    launchOptions: {
      slowMo: isDemo ? 800 : 0,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
