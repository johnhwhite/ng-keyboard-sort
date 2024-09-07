import { defineConfig } from '@playwright/test';

const config = defineConfig({
  outputDir: '../../dist/playwright',
  testDir: './tests',
  webServer: {
    command: 'npx ng s e2e --port 4204',
    port: 4204,
    timeout: 120 * 1000,
    cwd: '../..',
  },
});

export default config;
