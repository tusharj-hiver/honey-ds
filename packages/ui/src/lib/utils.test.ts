import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps a token font size and a token text colour together', () => {
    expect(cn('text-14', 'text-neutral-strong')).toBe('text-14 text-neutral-strong');
  });
  it('lets a later size win over an earlier one', () => {
    expect(cn('text-12 leading-14', 'text-14 leading-20')).toBe('text-14 leading-20');
  });
  it('lets a later colour win over an earlier one', () => {
    expect(cn('text-neutral-soft', 'text-neutral-strong')).toBe('text-neutral-strong');
  });
  it('merges Figma border widths', () => {
    expect(cn('border-w-14', 'border-w-18')).toBe('border-w-18');
  });
});
