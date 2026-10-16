import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AlertCircle, AlertTriangle, CheckCircle, InfoCircle } from '@honey-ds/icons';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { type PortalContainer, usePortalContainer } from '../lib/portal';
import { cn } from '../lib/utils';

/**
 * Honey DS Modal — Figma 7433:193 (Container, Body 7433:843…, Footer 7433:806…).
 * Surface, body and footer follow hiver-ui-kit's ModalContainer / ModalBody / ModalFooter figma-spec.md.
 * Focus trap, Escape, backdrop dismissal and focus return come from Base UI Dialog.
 *
 * Compose: <DialogContent> <DialogBody status> <DialogHeader> <DialogTitle/> <DialogDescription/>
 * </DialogHeader> </DialogBody> <DialogFooter>…buttons</DialogFooter> </DialogContent>.
 */

export function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/** Renders a <button> by default; pass `render={<Button … />}` to use the DS button. */
export function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/** Closes the dialog. Pass `render={<Button … />}` for a footer action. */
export function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export type DialogContentProps = DialogPrimitive.Popup.Props & {
  /** Portal target, e.g. a ShadowRoot. Falls back to PortalContainerProvider, then document.body. */
  container?: PortalContainer;
};

/** Backdrop + centred surface: white, 1px soft border, radius/16, elevation/md, 440 wide (Figma). */
export function DialogContent({ className, children, container, ...props }: DialogContentProps) {
  const portalContainer = usePortalContainer(container);
  return (
    <DialogPrimitive.Portal container={portalContainer}>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className={cn(
          'fixed inset-0 z-50 bg-overlay',
          'transition-opacity duration-150 motion-reduce:transition-none',
          'data-starting-style:opacity-0 data-ending-style:opacity-0',
        )}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            'pointer-events-auto flex max-h-full w-110 max-w-full flex-col overflow-hidden outline-none',
            'rounded-16 border border-w-14 border-neutral-soft bg-neutral-white font-sans shadow-md',
            'transition-[opacity,scale] duration-150 motion-reduce:transition-none',
            'data-starting-style:scale-95 data-starting-style:opacity-0',
            'data-ending-style:scale-95 data-ending-style:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </div>
    </DialogPrimitive.Portal>
  );
}

/** Title + description stack. Centred when the body is `align="vertical"`. */
export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex min-w-0 flex-1 flex-col gap-1', className)}
      {...props}
    />
  );
}

/** `body/lg/medium`, `text/neutral/strong`. */
export function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-16 leading-24 font-medium text-neutral-strong', className)}
      {...props}
    />
  );
}

/** `body/md/regular`, `text/neutral/default`. */
export function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-14 leading-20 text-neutral-default', className)}
      {...props}
    />
  );
}

export type DialogStatus = 'error' | 'warning' | 'success' | 'info';

const statusChip = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full p-3 [&_svg]:size-4',
  {
    variants: {
      status: {
        error: 'bg-error-soft text-fg-error-default',
        // Figma binds foreground/warning/soft here, not /default (ModalBody spec).
        warning: 'bg-warning-soft text-fg-warning-soft',
        success: 'bg-success-soft text-fg-success-default',
        info: 'bg-info-soft text-fg-info-default',
      },
    },
  },
);

const STATUS_ICON = {
  // Same icons as Toast, so an error looks the same everywhere.
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: InfoCircle,
} as const;

const dialogBody = cva('flex bg-neutral-white p-5', {
  variants: {
    align: {
      horizontal: 'flex-row items-start gap-4',
      vertical:
        'flex-col items-center gap-3 text-center [&_[data-slot=dialog-header]]:items-center',
    },
  },
  defaultVariants: { align: 'horizontal' },
});

export type DialogBodyProps = ComponentProps<'div'> & {
  /** Status icon chip before the text (Figma Type). Omit for the Custom body. */
  status?: DialogStatus;
  /** Figma Alignment: icon beside the text, or stacked and centred. */
  align?: 'horizontal' | 'vertical';
};

/** Content region, padding spacing/5. */
export function DialogBody({ className, status, align, children, ...props }: DialogBodyProps) {
  const Icon = status ? STATUS_ICON[status] : null;
  return (
    <div data-slot="dialog-body" className={cn(dialogBody({ align }), className)} {...props}>
      {Icon ? (
        <span aria-hidden data-slot="dialog-status" className={statusChip({ status })}>
          <Icon />
        </span>
      ) : null}
      {children}
    </div>
  );
}

export type DialogFooterProps = ComponentProps<'div'> & {
  /** Leading content left of the actions (Figma Checkbox / Information / Slot footers). */
  leading?: ReactNode;
  /** Actions share the row equally (Figma `Stretch`). */
  stretch?: boolean;
};

/** Action bar: top border/neutral/subtle, px spacing/5, py spacing/4. Children are the actions. */
export function DialogFooter({
  className,
  leading,
  stretch = false,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex items-center gap-3 border-t border-neutral-subtle bg-neutral-white px-5 py-4',
        className,
      )}
      {...props}
    >
      {leading ? (
        <div
          data-slot="dialog-footer-leading"
          className="flex min-w-0 items-center gap-2 text-13 leading-19 text-neutral-default"
        >
          {leading}
        </div>
      ) : null}
      <div
        data-slot="dialog-footer-actions"
        className={cn(
          'flex flex-1 items-center gap-3',
          stretch ? 'justify-center *:flex-1' : 'justify-end',
        )}
      >
        {children}
      </div>
    </div>
  );
}
