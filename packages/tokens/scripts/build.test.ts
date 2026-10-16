import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dist = (f: string) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');

describe('dist (run `yarn tokens:build` first)', () => {
  const tokens = dist('tokens.css');
  it('uses HOT neutral greys with plain Light/Dark for Omni (C1)', () => {
    expect(tokens).toContain('--hds-color-gray-700: #404040;');
    expect(tokens).toContain('--hds-text-neutral-default: var(--hds-color-gray-700);');
  });
  it('declares tokens on :root and :host so they work inside a shadow root', () => {
    expect(tokens).toMatch(/^:root, :host \{/m);
  });
  it('switches semantics in dark mode and for system dark', () => {
    expect(tokens).toContain(
      ':root[data-theme="dark"], [data-theme="dark"], :host([data-theme="dark"])',
    );
    expect(tokens).toContain('@media (prefers-color-scheme: dark)');
  });
  it('removes Tailwind defaults and maps roles to their own utility namespaces', () => {
    const theme = dist('theme.css');
    expect(theme).toContain('--color-*: initial;');
    expect(theme).toContain(
      '--background-color-brand-default: var(--hds-background-brand-default);',
    );
    expect(theme).toContain('--text-color-neutral-strong: var(--hds-text-neutral-strong);');
  });
  it('maps the shadcn primary slot to the Omni button token', () => {
    expect(dist('shadcn.css')).toContain('--primary: var(--hds-button-bg);');
  });
});
