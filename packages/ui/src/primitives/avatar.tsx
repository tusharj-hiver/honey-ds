import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Avatar — Figma component set 4770:1200 (Type × Background × Color × Size × Shape).
 * Tokens follow hiver-ui-kit's Avatar figma-spec.md. Built on Base UI Avatar: the image shows once it
 * loads, otherwise the initials (or an icon) fallback. Circle uses rounded-full at every size; Figma's
 * sm binds radius/12 on 28px, a near-circle we don't reproduce. 3xs uses text-12 (Figma ≈9px is untokenized)
 * and shows one initial, as does 2xs.
 */
export const avatarVariants = cva(
  [
    'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden',
    'font-sans leading-none align-middle',
  ],
  {
    variants: {
      size: {
        '3xs': 'size-4 text-12 font-medium [&_svg]:size-2.5',
        '2xs': 'size-5 text-12 font-medium [&_svg]:size-3',
        xs: 'size-6 text-13 font-medium [&_svg]:size-3.5',
        sm: 'size-7 text-13 font-medium [&_svg]:size-4',
        md: 'size-8 text-18 font-semibold [&_svg]:size-4',
        lg: 'size-10 text-24 font-semibold [&_svg]:size-5',
        xl: 'size-12 text-24 font-semibold [&_svg]:size-6',
        '2xl': 'size-14 text-24 font-semibold [&_svg]:size-7',
        '3xl': 'size-16 text-24 font-semibold [&_svg]:size-8',
      },
      shape: { circle: 'rounded-full', rounded: '' },
    },
    compoundVariants: [
      { shape: 'rounded', size: ['3xs', '2xs'], className: 'rounded-4' },
      { shape: 'rounded', size: ['xs', 'sm'], className: 'rounded-6' },
      { shape: 'rounded', size: 'md', className: 'rounded-8' },
      { shape: 'rounded', size: 'lg', className: 'rounded-10' },
      { shape: 'rounded', size: ['xl', '2xl', '3xl'], className: 'rounded-12' },
    ],
    defaultVariants: { size: 'md', shape: 'circle' },
  },
);

export const AVATAR_COLORS = [
  'blue',
  'red',
  'orange',
  'green',
  'cyan',
  'violet',
  'fuchsia',
  'pink',
  'lime',
  'neutral',
] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type AvatarBackground = 'solid' | 'subtle';

// Literal class strings so Tailwind sees them. Neutral uses its own token family (Figma spec).
const COLORS: Record<AvatarColor, Record<AvatarBackground, string>> = {
  blue: {
    solid: 'bg-accents-blue-intense text-on-accents-blue',
    subtle: 'bg-accents-blue-subtle text-accents-blue-default',
  },
  red: {
    solid: 'bg-accents-red-intense text-on-accents-red',
    subtle: 'bg-accents-red-subtle text-accents-red-default',
  },
  orange: {
    solid: 'bg-accents-orange-intense text-on-accents-orange',
    subtle: 'bg-accents-orange-subtle text-accents-orange-default',
  },
  green: {
    solid: 'bg-accents-green-intense text-on-accents-green',
    subtle: 'bg-accents-green-subtle text-accents-green-default',
  },
  cyan: {
    solid: 'bg-accents-cyan-intense text-on-accents-cyan',
    subtle: 'bg-accents-cyan-subtle text-accents-cyan-default',
  },
  violet: {
    solid: 'bg-accents-violet-intense text-on-accents-violet',
    subtle: 'bg-accents-violet-subtle text-accents-violet-default',
  },
  fuchsia: {
    solid: 'bg-accents-fuchsia-intense text-on-accents-fuchsia',
    subtle: 'bg-accents-fuchsia-subtle text-accents-fuchsia-default',
  },
  pink: {
    solid: 'bg-accents-pink-intense text-on-accents-pink',
    subtle: 'bg-accents-pink-subtle text-accents-pink-default',
  },
  lime: {
    solid: 'bg-accents-lime-intense text-on-accents-lime',
    subtle: 'bg-accents-lime-subtle text-accents-lime-default',
  },
  // Figma binds text/on/accents/red here (a binding quirk); inverse foreground is what reads on it.
  neutral: {
    solid: 'bg-neutral-bold-soft text-fg-inverse',
    subtle: 'bg-neutral-strong text-fg-neutral-bold-default',
  },
};

const ACCENTS = AVATAR_COLORS.filter((c) => c !== 'neutral');

/** "Jane Doe" → "JD", "jane@acme.com" → "J". One letter on the two smallest sizes. */
export function initialsOf(name: string, max = 2): string {
  const words = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters = words.length > 1 ? [words[0]![0], words.at(-1)![0]] : [words[0]?.[0]];
  return letters.filter(Boolean).join('').slice(0, max).toUpperCase();
}

/** The same name always gets the same accent colour. */
export function colorFor(name: string): AvatarColor {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length]!;
}

export type AvatarProps = Omit<AvatarPrimitive.Root.Props, 'children' | 'color'> &
  VariantProps<typeof avatarVariants> & {
    /** Person or inbox name: the accessible name, the initials and the default colour. */
    name: string;
    /** Photo URL (Figma Type=Picture). Initials show until it loads, or if it fails. */
    src?: string | undefined;
    /** Icon instead of initials (Figma Type=Icon). Pass an @honey-ds/icons element. */
    icon?: ReactNode;
    /** Figma `Background`. */
    background?: AvatarBackground;
    /** Figma `Color`. Defaults to a stable colour derived from `name`. */
    color?: AvatarColor;
  };

export function Avatar({
  className,
  name,
  src,
  icon,
  size = 'md',
  shape = 'circle',
  background = 'solid',
  color,
  ...props
}: AvatarProps) {
  const tone = color ?? (icon ? 'neutral' : colorFor(name));
  const small = size === '3xs' || size === '2xs';
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      role="img"
      aria-label={name}
      className={cn(avatarVariants({ size, shape }), COLORS[tone][background], className)}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt=""
          className="size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback data-slot="avatar-fallback" aria-hidden>
        {icon ?? initialsOf(name, small ? 1 : 2)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
