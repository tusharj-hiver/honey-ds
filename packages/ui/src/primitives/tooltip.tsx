import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import type { ReactNode } from 'react';
import { type PortalContainer, usePortalContainer } from '../lib/portal';
import { cn } from '../lib/utils';

/**
 * Honey DS Tooltip — Figma `Tooltip - Small` 373:1741 (label only) and `Tooltip - Large` 6149:2320
 * (label + description). Per hiver-ui-kit's Tooltip.figma-spec.md the two frames are content states,
 * not a size axis: passing `description` selects the two-line treatment. The Figma `Arrow` axis maps to
 * `side` + `arrow` (`Arrow=None` is `arrow={false}`).
 *
 * Token gap: the spec binds the label to text/inverse, but text/inverse stays gray-25 in dark mode while
 * background/neutral-bold/default flips to gray-100 (unreadable). The label uses foreground/inverse, which
 * flips with the bubble. The description is the label colour at opacity/80, not Figma's text/neutral/subtle,
 * which is 4.09:1 on the dark-mode bubble (below 4.5:1); this passes in both themes (≈10:1 / 8.7:1).
 *
 * Elevation: Figma's drop shadow here is unbound (0 4 12 -2 / 18%); the nearest token, `shadow-md`, is
 * used until design binds it.
 */

export type TooltipProviderProps = TooltipPrimitive.Provider.Props;

/** Shares open/close delays across tooltips so moving between triggers is instant. Base UI defaults. */
export function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

export function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/**
 * Renders a <button> by default; pass `render={<Button … />}` to use another element. Base UI tooltips
 * are not announced, so the trigger must carry its own accessible name (visible text or `aria-label`).
 */
export function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export type TooltipContentProps = Omit<TooltipPrimitive.Popup.Props, 'children'> &
  Pick<
    TooltipPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding'
  > & {
    /** The label (first line). */
    children: ReactNode;
    /** Optional muted second line. Its presence selects the two-line (Large) treatment. */
    description?: ReactNode;
    /** Show the pointer triangle. Figma `Arrow=None` → false. */
    arrow?: boolean;
    /** Portal target, e.g. a ShadowRoot. Falls back to PortalContainerProvider, then document.body. */
    container?: PortalContainer;
  };

export function TooltipContent({
  className,
  children,
  description,
  arrow = true,
  side = 'top',
  sideOffset = 6,
  align = 'center',
  alignOffset = 0,
  collisionPadding,
  container,
  ...props
}: TooltipContentProps) {
  const portalContainer = usePortalContainer(container);
  const withDescription = description != null;
  return (
    <TooltipPrimitive.Portal container={portalContainer}>
      <TooltipPrimitive.Positioner
        className="z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          data-description={withDescription || undefined}
          className={cn(
            'relative flex rounded-6 bg-neutral-bold-default px-3 font-sans text-12 leading-18 text-fg-inverse shadow-md',
            'origin-(--transform-origin) transition-opacity duration-150',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
            withDescription ? 'max-w-52 flex-col gap-1.5 py-2' : 'max-w-64 items-center py-1',
            className,
          )}
          {...props}
        >
          <span
            data-slot="tooltip-label"
            className={withDescription ? 'font-medium' : 'font-regular'}
          >
            {children}
          </span>
          {withDescription ? (
            <span
              data-slot="tooltip-description"
              className="font-regular text-fg-inverse opacity-(--hds-opacity-80)"
            >
              {description}
            </span>
          ) : null}
          {arrow ? (
            // A rotated square: half of it pokes out of the bubble as the 10×5 Figma triangle.
            <TooltipPrimitive.Arrow
              data-slot="tooltip-arrow"
              className={cn(
                'size-2 rotate-45 rounded-2 bg-neutral-bold-default',
                'data-[side=top]:-bottom-1 data-[side=bottom]:-top-1',
                'data-[side=left]:-right-1 data-[side=inline-start]:-right-1',
                'data-[side=right]:-left-1 data-[side=inline-end]:-left-1',
              )}
            />
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
