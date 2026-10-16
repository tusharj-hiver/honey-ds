import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'unit', include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
      },
      {
        plugins: [tailwindcss(), storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          // Play tests drive real keyboard focus, which only one frame can hold: run files one at
          // a time (parallel files time out on userEvent.tab/hover), and the dark project after.
          fileParallelism: false,
          sequence: { groupOrder: 1 },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        plugins: [tailwindcss(), storybookTest({ configDir: '.storybook' })],
        define: { __SB_THEME__: JSON.stringify('dark') },
        test: {
          name: 'storybook-dark',
          fileParallelism: false,
          sequence: { groupOrder: 2 },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
