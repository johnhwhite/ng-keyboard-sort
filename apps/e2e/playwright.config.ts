import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npx nx serve e2e',
    port: 4200,
    timeout: 120 * 1000,
    cwd: '../..',
  },
  testDir: './tests',
};

export default config;
