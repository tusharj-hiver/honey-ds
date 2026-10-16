import type { Decorator, Preview } from '@storybook/react-vite';
import { type ReactNode, useEffect } from 'react';
import '../src/styles.css';

// The theme is set on <html>, exactly as the app does, so stories see the same tokens.
function Theme({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <div className="bg-neutral-white p-4 font-sans text-neutral-default">{children}</div>;
}

const withTheme: Decorator = (Story, ctx) => {
  const { theme } = ctx.globals as { theme: string };
  return (
    <Theme theme={theme}>
      <Story />
    </Theme>
  );
};

// The Vitest "storybook-dark" project defines this, so CI runs every story (and axe) in dark too.
declare const __SB_THEME__: string | undefined;
const initialTheme = typeof __SB_THEME__ === 'string' ? __SB_THEME__ : 'light';

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Light or dark scheme',
      toolbar: { icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: initialTheme },
  parameters: {
    a11y: {
      test: 'error',
      // body, not the story root: tooltips and menus portal outside it.
      context: 'body',
      // WCAG 2.2 target size (24×24) is off by default in axe.
      config: { rules: [{ id: 'target-size', enabled: true }] },
    },
    // Chromatic snapshots every story in both schemes (plan: light and dark).
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
    },
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};
export default preview;
