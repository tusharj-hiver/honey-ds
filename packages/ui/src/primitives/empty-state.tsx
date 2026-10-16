import { SearchRefraction } from '@honey-ds/icons';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

/**
 * Honey DS Empty state — Figma component set 7435:1535 (Size = Small / Medium / Large).
 * Layout and per-size tokens follow hiver-ui-kit's EmptyState.figma-spec.md: a circular bordered icon,
 * a title, an optional description and an optional single primary action, all centred.
 * Figma's fixed widths (260 / 320 / 440) are max widths here, so the block can shrink in narrow panes.
 */
const emptyStateVariants = cva('flex w-full flex-col items-center gap-5 rounded-16 text-center', {
  variants: {
    size: {
      sm: 'max-w-65',
      md: 'max-w-80',
      lg: 'max-w-110',
    },
  },
  defaultVariants: { size: 'sm' },
});

const ICON_WRAP = {
  sm: 'p-3 [&_svg]:size-4',
  md: 'p-3 [&_svg]:size-4',
  lg: 'size-15 [&_svg]:size-6',
} as const;

const TITLE = {
  sm: 'text-13 leading-19 font-medium',
  md: 'text-16 leading-24 font-medium',
  lg: 'text-18 leading-28 font-semibold',
} as const;

const DESCRIPTION = {
  sm: 'text-13 leading-19',
  md: 'text-14 leading-20',
  lg: 'text-16 leading-24',
} as const;

const ACTION_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> &
  VariantProps<typeof emptyStateVariants> & {
    /** The main line, e.g. "No conversations". */
    title: ReactNode;
    /** Optional supporting line (Figma `subheading`). */
    description?: ReactNode;
    /** Icon inside the circle. Defaults to the search glyph Figma uses; pass an @honey-ds/icons element. */
    icon?: ReactNode;
    /** Label of the single primary action (Figma `action`). Rendered only with `onAction`. */
    actionLabel?: ReactNode;
    onAction?: () => void;
    /** Render the title as a heading (h2–h4) when the empty state is the main content of a region. */
    headingLevel?: 2 | 3 | 4;
  };

export function EmptyState({
  className,
  size = 'sm',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  headingLevel,
  ...props
}: EmptyStateProps) {
  const s = size ?? 'sm';
  const Title = headingLevel ? (`h${headingLevel}` as const) : 'p';
  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ size: s }), className)}
      {...props}
    >
      <div className="flex w-full flex-col items-center gap-3">
        <span
          aria-hidden
          data-slot="empty-state-icon"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full border border-w-14 border-neutral-soft text-fg-neutral-bold-soft',
            ICON_WRAP[s],
          )}
        >
          {icon ?? <SearchRefraction />}
        </span>
        <div className="flex w-full flex-col gap-1 font-sans">
          <Title data-slot="empty-state-title" className={cn('text-neutral-strong', TITLE[s])}>
            {title}
          </Title>
          {description != null ? (
            <p
              data-slot="empty-state-description"
              className={cn('font-regular text-neutral-default', DESCRIPTION[s])}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actionLabel != null && onAction ? (
        <div className="flex w-full justify-center gap-3">
          <Button size={ACTION_SIZE[s]} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
