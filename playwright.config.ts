import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    // Vaste functie-URL, zodat de formuliertests hem kunnen onderscheppen, ook als .env iets anders zegt.
    env: { PUBLIC_FUNCTIONS_URL: 'http://127.0.0.1:54521/functions/v1' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
