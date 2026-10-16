import { describe, expect, it } from 'vitest';
import { crosscheck } from './crosscheck-lib.ts';
import type { DtcgTree } from './lib.ts';

const c = (v: string) => ({ $type: 'color', $value: v });
function trees(gray700: string, alias = '{color.gray.700}'): Map<string, DtcgTree> {
  const prim = { color: { gray: { '700': c(gray700) }, slate: { '700': c('#334155') } } };
  return new Map<string, DtcgTree>([
    ['primitives.Default', prim],
    ['primitives.HOT', prim],
    ['primitives.HIG', prim],
    ['numeric.Default', {}],
    ...['Light', 'Dark', 'Hot - Light', 'Hot - Dark'].map(
      (m) => [`semantic.${m}`, { text: { strong: c(alias) } }] as [string, DtcgTree],
    ),
    ['components.Omni', {}],
    ['components.HIG', {}],
  ]);
}

describe('crosscheck', () => {
  it('passes when export and scrape resolve to the same values', () => {
    expect(crosscheck(trees('#404040'), trees('#404040'))).toEqual([]);
  });
  it('fails on a changed final value, once per theme × scheme it reaches', () => {
    const findings = crosscheck(trees('#404041'), trees('#404040'));
    expect(findings.every((f) => f.level === 'error')).toBe(true);
    expect(findings.map((f) => f.where)).toContain('omni/light');
    expect(findings[0]!.message).toMatch(/color\.gray\.700: figma\/ #404041 ≠ scrape #404040/);
  });
  it('fails when an alias moves to a different colour (gray → slate)', () => {
    const findings = crosscheck(trees('#404040', '{color.slate.700}'), trees('#404040'));
    expect(findings.some((f) => f.message.startsWith('text.strong'))).toBe(true);
  });
  it('fails on a missing mode file', () => {
    const exported = trees('#404040');
    exported.delete('semantic.Dark');
    expect(crosscheck(exported, trees('#404040'))[0]!.message).toBe('in the scrape, not in figma/');
  });
});
