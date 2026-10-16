import { describe, expect, it } from 'vitest';
import { shadowCompatCss } from './shadow';

describe('shadowCompatCss', () => {
  it('turns @property defaults into declarations in the properties layer', () => {
    const css =
      '@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}' +
      '@property --tw-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }' +
      '@property --tw-ring-inset{syntax:"*";inherits:false}' +
      '.border{border-style:var(--tw-border-style)}';
    const out = shadowCompatCss(css);
    expect(out).toMatch(/^@layer properties \{/);
    expect(out).toContain('--tw-border-style: solid;');
    expect(out).toContain('--tw-shadow: 0 0 #0000;');
    expect(out).toContain('--tw-ring-inset: initial;');
  });

  it('returns nothing when there is no @property', () => {
    expect(shadowCompatCss('.a{color:red}')).toBe('');
  });
});
