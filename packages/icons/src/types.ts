import type { SVGProps } from 'react';

export type IconSize = 12 | 16 | 20 | 24 | 32;

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  /** Rendered width and height in px. Defaults to 20. */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  title?: string;
};
