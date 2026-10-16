import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Activity } from './index';

const manifest: { name: string; category: string; brand: boolean }[] = JSON.parse(
  readFileSync(new URL('./generated/manifest.json', import.meta.url), 'utf8'),
);

describe('@honey-ds/icons', () => {
  it('generates all 1,198 kit icons in 20 categories, 14 of them brand', () => {
    expect(manifest).toHaveLength(1198);
    expect(new Set(manifest.map((m) => m.category)).size).toBe(20);
    expect(manifest.filter((m) => m.brand)).toHaveLength(14);
  });
  it('is decorative by default and sized by the size prop', () => {
    const html = renderToStaticMarkup(<Activity size={16} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).not.toContain('#404040');
  });
  it('gets an accessible name from title', () => {
    const html = renderToStaticMarkup(<Activity title="Activity" />);
    expect(html).not.toContain('aria-hidden');
    expect(html).toMatch(/<title id="([^"]+)">Activity<\/title>/);
  });
  it('keeps brand fills in hiver-golden icons', () => {
    const brand = manifest.find((m) => m.brand)!;
    const src = readFileSync(new URL(`./generated/${brand.name}.tsx`, import.meta.url), 'utf8');
    expect(src).toContain('#FFCF54');
    expect(src).not.toContain('#404040');
  });
});
