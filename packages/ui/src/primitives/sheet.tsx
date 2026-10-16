import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { XClose } from '@honey-ds/icons';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { type PortalContainer, usePortalContainer } from '../lib/portal';
import { cn } from '../lib/utils';
import { IconButton } from './button';

/**
 * Honey DS Side drawer — Figma 8748:1288; sizes md 8709:1030 (560) and lg 8645:9928 (760).
 * Follows hiver-ui-kit's SideDrawer figma-spec.md: a right-anchored panel inset by spacing/1.5,
 * radius/12, 1px border/neutral/subtle, with a fixed header, a scrolling body and an optional footer.
 * Built on Base UI Dialog (modal: focus trap, Escape, backdrop dismissal, focus return).
 *
 * Token gap: the header title is Figma `body/2xl/medium` (20/30); there is no line-height/30, so it
 * uses 20/28.
 */

export function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/** Renders a <button> by default; pass `render={<Button … />}` to use the DS button. */
export function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/** Closes the sheet. Pass `render={<Button … />}` for a footer action. */
export function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

const sheetContent = cva(
  [
    'fixed inset-y-0 right-0 z-50 flex max-w-full p-1.5 outline-none',
    'transition-transform duration-200 ease-out motion-reduce:transition-none',
    'data-starting-style:translate-x-full data-ending-style:translate-x-full',
  ],
  {
    variants: {
      size: {
        md: 'w-140',
        lg: 'w-190',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type SheetContentProps = SheetPrimitive.Popup.Props &
  VariantProps<typeof sheetContent> & {
    /** Only `right` is designed so far. */
    side?: 'right';
    /** Portal target, e.g. a ShadowRoot. Falls back to PortalContainerProvider, then document.body. */
    container?: PortalContainer;
  };

export function SheetContent({
  className,
  children,
  size,
  side = 'right',
  container,
  ...props
}: SheetContentProps) {
  const portalContainer = usePortalContainer(container);
  return (
    <SheetPrimitive.Portal container={portalContainer}>
      <SheetPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className={cn(
          'fixed inset-0 z-50 bg-overlay',
          'transition-opacity duration-200 motion-reduce:transition-none',
          'data-starting-style:opacity-0 data-ending-style:opacity-0',
        )}
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetContent({ size }), className)}
        {...props}
      >
        <div
          data-slot="sheet-panel"
          className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-12 border border-w-14 border-neutral-subtle bg-neutral-white font-sans"
        >
          {children}
        </div>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export type SheetHeaderProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** The sheet's title (`body/2xl/medium`). */
  title: ReactNode;
  /** Optional leading node, e.g. an app icon. */
  leading?: ReactNode;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Hide the close button (Escape and the backdrop still close it). */
  hideClose?: boolean;
};

/** Fixed header: padding spacing/5, gap spacing/3, bottom border/neutral/subtle. */
export function SheetHeader({
  className,
  title,
  leading,
  closeLabel = 'Close',
  hideClose = false,
  ...props
}: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'flex shrink-0 items-center gap-3 border-b border-neutral-subtle bg-neutral-white p-5',
        className,
      )}
      {...props}
    >
      {leading ? (
        <div data-slot="sheet-leading" className="flex shrink-0 items-center pl-2">
          {leading}
        </div>
      ) : null}
      <SheetPrimitive.Title
        data-slot="sheet-title"
        className="min-w-0 flex-1 truncate pr-2 text-20 leading-28 font-medium text-neutral-strong"
      >
        {title}
      </SheetPrimitive.Title>
      {hideClose ? null : (
        <SheetPrimitive.Close
          render={
            <IconButton size="sm" variant="tertiary" icon={<XClose />} aria-label={closeLabel} />
          }
        />
      )}
    </div>
  );
}

/** Optional supporting line under the header; gives the dialog an accessible description. */
export function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-14 leading-20 text-neutral-default', className)}
      {...props}
    />
  );
}

/** Scrolling content: padding spacing/7 × spacing/5, gap spacing/6. */
export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-7 py-5', className)}
      {...props}
    />
  );
}

/** Optional fixed action bar: padding spacing/6 × spacing/3, top border/neutral/subtle. */
export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-t border-neutral-subtle bg-neutral-white px-6 py-3',
        className,
      )}
      {...props}
    />
  );
}
