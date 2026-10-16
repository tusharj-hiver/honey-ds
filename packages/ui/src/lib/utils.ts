import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Honey DS scales (packages/tokens). tailwind-merge must know them, otherwise `text-14` (size) and
// `text-neutral-strong` (colour) look like the same group and one silently disappears.
const FONT_SIZES = ['12', '13', '14', '16', '18', '20', '24', '28'];
const LINE_HEIGHTS = ['14', '18', '19', '20', '22', '24', '28', '32', '36'];
const BORDER_WIDTHS = ['0', '14', '18', '24', '32', '36', '40', '48'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      leading: [{ leading: LINE_HEIGHTS }],
      'border-w': [{ 'border-w': BORDER_WIDTHS }],
      shadow: ['focus-ring', 'focus-ring-brand', 'focus-ring-error'],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
