import { describe, expect, it } from 'vitest';
import { normalizeColor, pathOf, setPath, toToken, type DtcgTree } from './lib.ts';

describe('normalizeColor', () => {
  it('keeps opaque hex upper-cased', () => expect(normalizeColor('#ffcf54')).toBe('#FFCF54'));
  it('rounds alpha instead of truncating (30% → 4D, not 4C)', () =>
    expect(normalizeColor('#246FEA · 30%')).toBe('#246FEA4D'));
  it('encodes 50% as 80', () => expect(normalizeColor('#737373 · 50%')).toBe('#73737380'));
  it('rejects non-colours', () => expect(normalizeColor('scale/4')).toBeNull());
});

describe('toToken', () => {
  const known = new Set(['color/gray/700', 'scale/1_5']);
  it('turns known names into DTCG aliases', () =>
    expect(toToken('text/neutral/default', 'color/gray/700', known)).toEqual({
      $type: 'color',
      $value: '{color.gray.700}',
    }));
  it('types radius aliases as dimensions', () =>
    expect(toToken('radius/6', 'scale/1_5', known)).toEqual({
      $type: 'dimension',
      $value: '{scale.1_5}',
    }));
  it('adds px to scale and font sizes', () => {
    expect(toToken('scale/4', '16', known)).toEqual({ $type: 'dimension', $value: '16px' });
    expect(toToken('font-size/14', '14', known)).toEqual({ $type: 'dimension', $value: '14px' });
  });
  it('fails loudly on an unknown group', () =>
    expect(() => toToken('mystery/x', '3', known)).toThrow('No type rule'));
});

describe('setPath', () => {
  it('lower-cases Figma names and rejects collisions', () => {
    const tree: DtcgTree = {};
    setPath(tree, pathOf('text/neutral/White'), { $type: 'color', $value: '#FFFFFF' });
    expect(() =>
      setPath(tree, pathOf('text/neutral/white'), { $type: 'color', $value: '#FFFFFF' }),
    ).toThrow('Duplicate');
  });
});
