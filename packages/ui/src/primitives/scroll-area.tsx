import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Scrollable region with thin, token-coloured overlay scrollbars (no Figma component: Honey DS draws
 * scrollbars in context only). Built on Base UI ScrollArea, which keeps native scrolling, so wheel,
 * touch, keyboard and screen-reader behaviour are the browser's own.
 *
 * Keyboard: Base UI makes the viewport focusable (tabIndex 0) whenever it overflows, so arrow keys and
 * Page Up/Down scroll it. Give it an `aria-label` when the region has no visible heading, so the focus
 * stop has a name.
 */
export type ScrollAreaProps = Omit<ScrollAreaPrimitive.Root.Props, 'children'> & {
  children?: ReactNode;
  /** Which scrollbars to render. Content that overflows on the other axis is clipped. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Accessible name for the focusable viewport. */
  'aria-label'?: string;
  /** Class for the viewport (e.g. a max height). The root takes `className`. */
  viewportClassName?: string;
};

export function ScrollArea({
  className,
  children,
  orientation = 'vertical',
  'aria-label': ariaLabel,
  viewportClassName,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative flex min-h-0 overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // A named, focusable scroll container is a landmark-like region (Base UI defaults to presentation).
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
        className={cn(
          'min-h-0 w-full flex-1 overscroll-contain rounded-[inherit] outline-none focus-visible:focus-ring',
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' ? <ScrollBar orientation="vertical" /> : null}
      {orientation !== 'vertical' ? <ScrollBar orientation="horizontal" /> : null}
      {orientation === 'both' ? <ScrollAreaPrimitive.Corner /> : null}
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        // Base UI positions the bar absolutely along the root's edge.
        'flex touch-none p-0.5 opacity-0 transition-opacity select-none',
        'data-hovering:opacity-100 data-scrolling:opacity-100',
        orientation === 'vertical' ? 'w-2.5' : 'h-2.5 flex-col',
      )}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        // Base UI sets the thumb's length; it fills the bar's thickness.
        className="rounded-full bg-neutral-strong data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
