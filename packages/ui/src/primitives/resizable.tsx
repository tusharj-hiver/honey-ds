import type { ComponentProps } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '../lib/utils';

/**
 * Resizable panes (no Figma component: the 3-pane app layout uses it). shadcn's Resizable API on
 * react-resizable-panels v4 (`Group` / `Panel` / `Separator`).
 *
 * Sizes: in v4 a number is pixels and a unitless string is a percentage ("50" = 50%). Pane widths
 * follow the manual `--hds-layout-*` tokens (list 320 [280–560], side 400 [280–640], conversation min
 * 480); the library needs literal values, so callers pass them in px.
 *
 * Keyboard: the handle is a focusable `role="separator"` with aria-valuenow; arrow keys resize, Home/End
 * jump to the limits and Enter collapses a collapsible pane (all from the library). Give each handle an
 * `aria-label` naming the panes it divides.
 */
export function ResizablePanelGroup({ className, ...props }: ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      // The library sets display:flex and the direction from `orientation`.
      className={cn('h-full w-full', className)}
      {...props}
    />
  );
}

export function ResizablePanel({ className, ...props }: ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" className={cn('min-w-0', className)} {...props} />;
}

export type ResizableHandleProps = ComponentProps<typeof Separator> & {
  /** Names the panes this handle divides, e.g. "Resize conversation list". */
  'aria-label': string;
  /**
   * `line`: a 1px divider between flush panes. `gap`: the 8px gutter between floating panels;
   * invisible until hovered, dragged or focused, then a 2px line down its middle.
   */
  variant?: 'line' | 'gap';
};

/**
 * A divider with a wider invisible hit area. Highlights on hover, drag and keyboard focus.
 */
export function ResizableHandle({ className, variant = 'line', ...props }: ResizableHandleProps) {
  if (variant === 'gap')
    return (
      <Separator
        data-slot="resizable-handle"
        className={cn(
          'group/handle relative flex w-2 shrink-0 items-center justify-center rounded-full outline-none',
          'before:h-full before:w-0.5 before:rounded-full before:transition-colors',
          'data-[separator=active]:before:bg-royal-default data-[separator=focus]:before:bg-royal-default data-[separator=hover]:before:bg-royal-default',
          'aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:before:h-0.5 aria-[orientation=horizontal]:before:w-full',
          className,
        )}
        {...props}
      />
    );
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px shrink-0 items-center justify-center bg-neutral-default outline-none transition-colors',
        // Hit area: 4px either side of the 1px line.
        'after:absolute after:inset-y-0 after:-inset-x-1',
        // data-separator: inactive | hover | focus | active (dragging) | disabled, set by the library.
        'data-[separator=active]:bg-royal-default data-[separator=focus]:bg-royal-default data-[separator=hover]:bg-royal-default',
        'focus-visible:focus-ring',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full',
        'aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-inset-y-1',
        className,
      )}
      {...props}
    />
  );
}
