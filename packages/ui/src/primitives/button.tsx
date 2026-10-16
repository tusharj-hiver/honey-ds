import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Button — Figma component set 65:178 (Button page 492:6151).
 * Variants, sizes and per-state tokens follow hiver-ui-kit's Button.figma-spec.md.
 * Surface variants focus with the royal ring; link variants with the brand (yellow) ring.
 */
export const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-sans font-medium',
    'border border-transparent outline-none select-none transition-colors',
    'disabled:pointer-events-none data-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'rounded-button bg-button border-button text-button',
          'hover:bg-button-hover active:bg-button-hover focus-visible:focus-ring',
        ],
        secondary: [
          'rounded-6 bg-neutral-subtle border-neutral-default text-neutral-strong',
          'hover:bg-neutral-default active:bg-neutral-default focus-visible:focus-ring',
        ],
        tertiary: [
          'rounded-6 bg-transparent text-neutral-default',
          'hover:bg-neutral-default active:bg-neutral-default focus-visible:focus-ring',
        ],
        destructive: [
          'rounded-6 bg-error-default border-error-strong text-on-error',
          'hover:bg-error-strong active:bg-error-strong focus-visible:focus-ring',
        ],
        filled: [
          'rounded-6 bg-neutral-soft border-neutral-default text-neutral-strong',
          'hover:bg-neutral-default active:bg-neutral-default focus-visible:focus-ring',
        ],
        link: 'rounded-0 text-link hover:text-link-hover active:text-link-hover focus-visible:focus-ring-brand',
        linkSecondary:
          'rounded-0 text-neutral-default hover:text-fg-neutral-bold-default active:text-fg-neutral-bold-default focus-visible:focus-ring-brand',
        linkReverse:
          'rounded-0 text-inverse hover:text-fg-static-white active:text-fg-static-white focus-visible:focus-ring-brand',
        linkDanger:
          'rounded-0 text-error-default hover:text-error-strong active:text-error-strong focus-visible:focus-ring-brand',
      },
      size: {
        '2xs': 'min-h-6 gap-1 px-2 text-12 leading-14 border-w-14',
        xs: 'min-h-7 gap-1 px-2 text-12 leading-14 border-w-18',
        sm: 'min-h-8 gap-1.5 px-3 text-13 leading-19 border-w-18',
        md: 'min-h-9 gap-2 px-4 text-14 leading-20 border-w-18',
        lg: 'min-h-10 gap-2 px-5 text-16 leading-24 border-w-32',
      },
      underline: { true: 'underline underline-offset-4', false: '' },
    },
    compoundVariants: [
      // Link variants are surfaceless: no padding, no fixed height.
      {
        variant: ['link', 'linkSecondary', 'linkReverse', 'linkDanger'],
        className: 'min-h-0 px-0 border-0',
      },
      // Disabled rebinds tokens (Figma does not rely on opacity). Link reverse keeps its rest tokens.
      {
        variant: ['primary', 'secondary', 'destructive', 'filled'],
        className:
          'disabled:bg-disabled disabled:border-disabled disabled:text-disabled data-disabled:bg-disabled data-disabled:border-disabled data-disabled:text-disabled',
      },
      {
        variant: ['tertiary', 'link', 'linkSecondary', 'linkDanger'],
        className: 'disabled:text-disabled data-disabled:text-disabled',
      },
    ],
    defaultVariants: { variant: 'primary', size: 'md', underline: false },
  },
);

const ICON_SIZE = { '2xs': 12, xs: 14, sm: 16, md: 16, lg: 20 } as const;
const ICON_COLOR: Partial<Record<NonNullable<ButtonVariantProps['variant']>, string>> = {
  primary: 'text-button-icon',
  secondary: 'text-fg-neutral-bold-soft',
  tertiary: 'text-fg-neutral-bold-soft',
  destructive: 'text-button-icon-destructive',
  filled: 'text-fg-neutral-bold-soft',
};

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ButtonPrimitive.Props &
  ButtonVariantProps & {
    /** Icon before the label. Pass an @honey-ds/icons component element. */
    leadingIcon?: ReactNode;
    /** Icon after the label. */
    trailingIcon?: ReactNode;
  };

function IconSlot({
  children,
  size,
  tone,
}: {
  children: ReactNode;
  size: number;
  tone?: string | undefined;
}) {
  return (
    <span
      aria-hidden
      data-icon-size={size}
      className={cn(
        'inline-flex shrink-0 group-disabled/button:text-disabled group-data-disabled/button:text-disabled',
        size === 12 && '[&_svg]:size-3',
        size === 14 && '[&_svg]:size-3.5',
        size === 16 && '[&_svg]:size-4',
        size === 20 && '[&_svg]:size-5',
        tone,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  underline = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  const iconSize = ICON_SIZE[size ?? 'md'];
  const tone = ICON_COLOR[variant ?? 'primary'];
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, underline }), className)}
      {...props}
    >
      {leadingIcon ? (
        <IconSlot size={iconSize} tone={tone}>
          {leadingIcon}
        </IconSlot>
      ) : null}
      {children}
      {trailingIcon ? (
        <IconSlot size={iconSize} tone={tone}>
          {trailingIcon}
        </IconSlot>
      ) : null}
    </ButtonPrimitive>
  );
}

/** Square sizes: the Button height on both axes, no horizontal padding. */
const ICON_BUTTON_SIZE = {
  '2xs': 'size-6 min-h-6 px-0',
  xs: 'size-7 min-h-7 px-0',
  sm: 'size-8 min-h-8 px-0',
  md: 'size-9 min-h-9 px-0',
  lg: 'size-10 min-h-10 px-0',
} as const;

export type IconButtonProps = Omit<
  ButtonProps,
  'leadingIcon' | 'trailingIcon' | 'children' | 'underline' | 'variant'
> & {
  /** Surface variants only: a link-style icon button has no visible target. */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'filled';
  /** The icon. Pass an @honey-ds/icons component element. */
  icon: ReactNode;
  /** Required: an icon-only button has no visible text, so this is its accessible name. */
  'aria-label': string;
};

/**
 * Icon-only Button: Button's variants, sizes and state tokens (Figma 65:178), square, with a
 * required accessible name. Defaults to tertiary, the usual toolbar treatment.
 */
export function IconButton({
  className,
  variant = 'tertiary',
  size = 'md',
  icon,
  ...props
}: IconButtonProps) {
  const s = size ?? 'md';
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      className={cn(buttonVariants({ variant, size: s }), ICON_BUTTON_SIZE[s], className)}
      {...props}
    >
      <IconSlot size={ICON_SIZE[s]} tone={ICON_COLOR[variant]}>
        {icon}
      </IconSlot>
    </ButtonPrimitive>
  );
}
