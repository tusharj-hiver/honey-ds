import { XClose } from '@honey-ds/icons';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Tag — Figma frame 374:1775 (Tone × Size × Stroke × Close).
 * A compact, optionally removable chip. The remove control is a real <button> with an accessible name.
 */
export const tagVariants = cva(
  'inline-flex min-w-0 max-w-24 items-center justify-center gap-1 font-sans font-medium border border-w-14',
  {
    variants: {
      tone: {
        neutral: 'bg-accents-gray-soft border-accents-gray-soft text-accents-gray-default',
        info: 'bg-accents-blue-subtle border-accents-blue-soft text-accents-blue-intense',
        success: 'bg-accents-green-subtle border-accents-green-soft text-accents-green-intense',
        warning: 'bg-accents-orange-subtle border-accents-orange-soft text-accents-orange-intense',
        error: 'bg-accents-red-subtle border-accents-red-soft text-accents-red-intense',
      },
      size: {
        sm: 'rounded-4 px-1 text-12 leading-18',
        md: 'rounded-6 px-1.5 py-0.5 text-13 leading-19',
      },
      bordered: { true: '', false: 'border-transparent' },
    },
    defaultVariants: { tone: 'neutral', size: 'sm', bordered: true },
  },
);

export type TagVariantProps = VariantProps<typeof tagVariants>;

export type TagProps = Omit<ComponentProps<'span'>, 'children'> &
  TagVariantProps & {
    /** Tag label. Truncates past the 96px max width (full text stays in the title). */
    children: ReactNode;
    /** Optional leading icon (code-side extension; not a Figma axis yet). */
    icon?: ReactNode;
    /** Show the trailing remove button (Figma `Close`). */
    removable?: boolean;
    /** Fired when the remove button is activated (click, Enter or Space). */
    onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
    /** Accessible name for the remove button. Defaults to "Remove <label>" for string labels. */
    removeLabel?: string;
  };

export function Tag({
  className,
  tone = 'neutral',
  size = 'sm',
  bordered = true,
  icon,
  removable = false,
  onRemove,
  removeLabel,
  children,
  ...props
}: TagProps) {
  const text =
    typeof children === 'string' || typeof children === 'number' ? String(children) : undefined;
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ tone, size, bordered }), className)}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            'inline-flex shrink-0',
            size === 'md' ? '[&_svg]:size-3.5' : '[&_svg]:size-3',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span data-slot="tag-label" className="min-w-0 truncate" title={text}>
        {children}
      </span>
      {removable ? (
        <button
          type="button"
          data-slot="tag-remove"
          aria-label={removeLabel ?? (text ? `Remove ${text}` : 'Remove')}
          onClick={onRemove}
          // Icon in the tag's own text colour (Figma's alpha-30 is ~2:1, below 3:1 for controls).
          // Drawn at 16px, but the ::after extends the hit area to 24×24 (WCAG 2.2 target size).
          className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-6 outline-none transition-colors after:absolute after:-inset-1 hover:bg-alpha-black-5 focus-visible:focus-ring [&_svg]:size-3"
        >
          <XClose aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
