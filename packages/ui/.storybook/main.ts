import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
    'storybook-addon-pseudo-states',
  ],
  viteFinal: (cfg) =>
    mergeConfig(cfg, {
      plugins: [tailwindcss()],
    }),
};
export default config;
