import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npx ng s e2e --port 4204',
    port: 4204,
    timeout: 120 * 1000,
    cwd: '../..',
  },
  testDir: './tests',
};

export default config;
