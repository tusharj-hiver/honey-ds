import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Badge — Figma component set 279:4301.
 * Axes follow hiver-ui-kit's Badge.figma-spec.md: Variant (subtle | outline | solid | ghost) × Tone × Size × Shape.
 * Every variant carries a 1px border (transparent unless outline) so all variants share one footprint.
 */
export const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap font-sans font-medium',
    'border border-w-14 border-transparent',
  ],
  {
    variants: {
      size: {
        // xs uses leading-14 so content + 1px borders fits the 18px floor.
        xs: 'min-h-4.5 px-1.5 text-12 leading-14',
        sm: 'min-h-5.5 px-2 text-12 leading-18',
        md: 'min-h-6 px-2 text-13 leading-19',
        lg: 'min-h-7 px-2.5 text-14 leading-20',
      },
      shape: { pill: 'rounded-full', rounded: '' },
    },
    compoundVariants: [
      { shape: 'rounded', size: ['xs', 'sm'], className: 'rounded-4' },
      { shape: 'rounded', size: 'md', className: 'rounded-6' },
      { shape: 'rounded', size: 'lg', className: 'rounded-8' },
    ],
    defaultVariants: { size: 'md', shape: 'pill' },
  },
);

export const BADGE_VARIANTS = ['subtle', 'outline', 'solid', 'ghost'] as const;
export const BADGE_TONES = [
  'neutral',
  'brand',
  'success',
  'warning',
  'error',
  'info',
  'amber',
  'cyan',
  'fuchsia',
  'indigo',
  'lime',
  'pink',
  'sky',
  'teal',
  'violet',
] as const;

export type BadgeVariant = (typeof BADGE_VARIANTS)[number];
export type BadgeTone = (typeof BADGE_TONES)[number];

type ToneClasses = Record<BadgeVariant, string> & { icon: string; solidIcon: string };

// Literal class strings (Tailwind scans source). Neutral has no `intense` step, Warning's solid is
// `strong` in Figma (we use `intense`, see below), Neutral/Success outline borders are `default` — all per the Figma spec's per-tone specials.
const TONES: Record<BadgeTone, ToneClasses> = {
  neutral: {
    subtle: 'bg-accents-gray-soft text-accents-gray-default',
    outline: 'bg-accents-gray-soft border-accents-gray-default text-accents-gray-default',
    solid: 'bg-neutral-bold-strong text-neutral-white',
    ghost: 'text-accents-gray-default',
    icon: 'text-fg-accents-gray-default',
    solidIcon: 'text-fg-neutral-subtle',
  },
  // Brand is not in the Figma tone axis; it mirrors the brand-yellow Button tokens.
  brand: {
    subtle: 'bg-brand-subtle text-brand-intense',
    outline: 'bg-brand-subtle border-brand-soft text-brand-intense',
    solid: 'bg-brand-default text-on-brand',
    ghost: 'text-brand-intense',
    icon: 'text-fg-brand-intense',
    solidIcon: 'text-fg-on-brand',
  },
  success: {
    subtle: 'bg-accents-green-subtle text-accents-green-intense',
    outline: 'bg-accents-green-subtle border-accents-green-default text-accents-green-intense',
    solid: 'bg-accents-green-intense text-on-accents-green',
    ghost: 'text-accents-green-intense',
    icon: 'text-fg-accents-green-intense',
    solidIcon: 'text-fg-on-accents-green',
  },
  warning: {
    subtle: 'bg-accents-orange-subtle text-accents-orange-intense',
    outline: 'bg-accents-orange-subtle border-accents-orange-soft text-accents-orange-intense',
    // Figma binds orange/strong (#EA580C), which fails AA (3.55:1) under white text; intense passes.
    solid: 'bg-accents-orange-intense text-on-accents-orange',
    ghost: 'text-accents-orange-intense',
    icon: 'text-fg-accents-orange-intense',
    solidIcon: 'text-fg-on-accents-orange',
  },
  error: {
    subtle: 'bg-accents-red-subtle text-accents-red-intense',
    outline: 'bg-accents-red-subtle border-accents-red-soft text-accents-red-intense',
    solid: 'bg-accents-red-intense text-on-accents-red',
    ghost: 'text-accents-red-intense',
    icon: 'text-fg-accents-red-intense',
    solidIcon: 'text-fg-on-accents-red',
  },
  info: {
    subtle: 'bg-accents-blue-subtle text-accents-blue-intense',
    outline: 'bg-accents-blue-subtle border-accents-blue-soft text-accents-blue-intense',
    solid: 'bg-accents-blue-intense text-on-accents-blue',
    ghost: 'text-accents-blue-intense',
    icon: 'text-fg-accents-blue-intense',
    solidIcon: 'text-fg-on-accents-blue',
  },
  amber: {
    subtle: 'bg-accents-amber-subtle text-accents-amber-intense',
    outline: 'bg-accents-amber-subtle border-accents-amber-soft text-accents-amber-intense',
    solid: 'bg-accents-amber-intense text-on-accents-amber',
    ghost: 'text-accents-amber-intense',
    icon: 'text-fg-accents-amber-intense',
    solidIcon: 'text-fg-on-accents-amber',
  },
  cyan: {
    subtle: 'bg-accents-cyan-subtle text-accents-cyan-intense',
    outline: 'bg-accents-cyan-subtle border-accents-cyan-soft text-accents-cyan-intense',
    solid: 'bg-accents-cyan-intense text-on-accents-cyan',
    ghost: 'text-accents-cyan-intense',
    icon: 'text-fg-accents-cyan-intense',
    solidIcon: 'text-fg-on-accents-cyan',
  },
  fuchsia: {
    subtle: 'bg-accents-fuchsia-subtle text-accents-fuchsia-intense',
    outline: 'bg-accents-fuchsia-subtle border-accents-fuchsia-soft text-accents-fuchsia-intense',
    solid: 'bg-accents-fuchsia-intense text-on-accents-fuchsia',
    ghost: 'text-accents-fuchsia-intense',
    icon: 'text-fg-accents-fuchsia-intense',
    solidIcon: 'text-fg-on-accents-fuchsia',
  },
  indigo: {
    subtle: 'bg-accents-indigo-subtle text-accents-indigo-intense',
    outline: 'bg-accents-indigo-subtle border-accents-indigo-soft text-accents-indigo-intense',
    solid: 'bg-accents-indigo-intense text-on-accents-indigo',
    ghost: 'text-accents-indigo-intense',
    icon: 'text-fg-accents-indigo-intense',
    solidIcon: 'text-fg-on-accents-indigo',
  },
  lime: {
    subtle: 'bg-accents-lime-subtle text-accents-lime-intense',
    outline: 'bg-accents-lime-subtle border-accents-lime-soft text-accents-lime-intense',
    solid: 'bg-accents-lime-intense text-on-accents-lime',
    ghost: 'text-accents-lime-intense',
    icon: 'text-fg-accents-lime-intense',
    solidIcon: 'text-fg-on-accents-lime',
  },
  pink: {
    subtle: 'bg-accents-pink-subtle text-accents-pink-intense',
    outline: 'bg-accents-pink-subtle border-accents-pink-soft text-accents-pink-intense',
    solid: 'bg-accents-pink-intense text-on-accents-pink',
    ghost: 'text-accents-pink-intense',
    icon: 'text-fg-accents-pink-intense',
    solidIcon: 'text-fg-on-accents-pink',
  },
  sky: {
    subtle: 'bg-accents-sky-subtle text-accents-sky-intense',
    outline: 'bg-accents-sky-subtle border-accents-sky-soft text-accents-sky-intense',
    // Figma's sky intense (#0081C2) gives 4.27:1 with white; sky-800 is the next step and passes.
    solid: 'bg-(--hds-color-sky-800) text-on-accents-sky',
    ghost: 'text-accents-sky-intense',
    icon: 'text-fg-accents-sky-intense',
    solidIcon: 'text-fg-on-accents-sky',
  },
  teal: {
    subtle: 'bg-accents-teal-subtle text-accents-teal-intense',
    outline: 'bg-accents-teal-subtle border-accents-teal-soft text-accents-teal-intense',
    solid: 'bg-accents-teal-intense text-on-accents-teal',
    ghost: 'text-accents-teal-intense',
    icon: 'text-fg-accents-teal-intense',
    solidIcon: 'text-fg-on-accents-teal',
  },
  violet: {
    subtle: 'bg-accents-violet-subtle text-accents-violet-intense',
    outline: 'bg-accents-violet-subtle border-accents-violet-soft text-accents-violet-intense',
    solid: 'bg-accents-violet-intense text-on-accents-violet',
    ghost: 'text-accents-violet-intense',
    icon: 'text-fg-accents-violet-intense',
    solidIcon: 'text-fg-on-accents-violet',
  },
};

const ICON_SIZE = {
  xs: '[&_svg]:size-3',
  sm: '[&_svg]:size-3',
  md: '[&_svg]:size-3.5',
  lg: '[&_svg]:size-4',
} as const;

export type BadgeProps = Omit<ComponentProps<'span'>, 'children'> &
  VariantProps<typeof badgeVariants> & {
    /** Fill style (Figma `Variant`). */
    variant?: BadgeVariant;
    /** Palette family (Figma `Tone`). */
    tone?: BadgeTone;
    /** Leading icon. Pass an @honey-ds/icons component element. */
    icon?: ReactNode;
    /** Badge label. Omit for an icon-only badge (then give it an aria-label). */
    children?: ReactNode;
  };

export function Badge({
  className,
  variant = 'subtle',
  tone = 'neutral',
  size = 'md',
  shape = 'pill',
  icon,
  children,
  ...props
}: BadgeProps) {
  const toneClasses = TONES[tone];
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      className={cn(badgeVariants({ size, shape }), toneClasses[variant], className)}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden
          data-slot="badge-icon"
          className={cn(
            'inline-flex shrink-0',
            ICON_SIZE[size ?? 'md'],
            variant === 'solid' ? toneClasses.solidIcon : toneClasses.icon,
          )}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
