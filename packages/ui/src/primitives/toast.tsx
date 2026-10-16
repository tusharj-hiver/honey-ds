import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  InfoCircle,
  Stars01,
  XClose,
} from '@honey-ds/icons';
import { cva } from 'class-variance-authority';
import { type ReactNode, useMemo } from 'react';
import { type PortalContainer, usePortalContainer } from '../lib/portal';
import { cn } from '../lib/utils';
import { Button, IconButton } from './button';

/**
 * Honey DS Toast — Figma `Alert & Notification & Toast` 6202:1288 (plan node 484:5412).
 * Tones, sizes and tokens follow hiver-ui-kit's Toast.figma-spec.md: a `Lighter` surface tinted per tone,
 * 1px tone border, elevation/sm, a leading tone icon, title (+ description and an action row in `lg`)
 * and a dismiss button. Figma's 340 / 390 widths are max widths; the toast is content-driven.
 *
 * Icons: Figma uses alert-circle for every tone; per-tone glyphs read faster (spec caveat), so error →
 * alert-circle, warning → alert-triangle, success → check-circle, info → info-circle, feature → stars.
 * Figma has no Large warning cell; `warning` + `lg` uses the same warning tokens.
 *
 * Live toasts: wrap the app in <ToastProvider>, render one <Toaster /> inside it and raise toasts with
 * `useToast().show(...)`. Base UI handles the live region, timers (paused on hover/focus), F6 to reach
 * the toasts, Escape to dismiss and swipe.
 */

export const TOAST_TONES = ['error', 'warning', 'success', 'info', 'feature'] as const;
export type ToastTone = (typeof TOAST_TONES)[number];
export type ToastSize = 'sm' | 'lg';

const toastVariants = cva('pointer-events-auto flex w-full border font-sans shadow-sm', {
  variants: {
    tone: {
      error: 'border-error-soft bg-error-subtle text-error-default',
      warning: 'border-warning-soft bg-warning-subtle text-warning-default',
      success: 'border-success-soft bg-success-subtle text-success-default',
      info: 'border-info-soft bg-info-subtle text-info-default',
      feature: 'border-neutral-soft bg-neutral-white text-neutral-strong',
    },
    size: {
      sm: 'min-h-11 max-w-85 items-center gap-2 rounded-8 px-2.5 py-2',
      lg: 'max-w-97.5 items-start gap-3 rounded-12 px-3 py-4',
    },
  },
  defaultVariants: { tone: 'info', size: 'sm' },
});

const ICON_TONE: Record<ToastTone, string> = {
  error: 'text-fg-error-default',
  warning: 'text-fg-warning-default',
  success: 'text-fg-success-default',
  info: 'text-fg-info-default',
  feature: 'text-fg-neutral-bold-default',
};

const DEFAULT_ICON: Record<ToastTone, ReactNode> = {
  error: <AlertCircle />,
  warning: <AlertTriangle />,
  success: <CheckCircle />,
  info: <InfoCircle />,
  feature: <Stars01 />,
};

export type ToastAction = { label: ReactNode; onClick: () => void };

export type ToastContentProps = {
  tone?: ToastTone;
  size?: ToastSize;
  title: ReactNode;
  /** Second line, `lg` only (Figma Small has no description slot). */
  description?: ReactNode;
  /** Overrides the tone icon; `false` hides it. */
  icon?: ReactNode | false;
  action?: ToastAction;
  /** Show the dismiss (×) button. */
  dismissible?: boolean;
};

type Parts = {
  Title: (p: { className: string; children: ReactNode }) => ReactNode;
  Description: (p: { className: string; children: ReactNode }) => ReactNode;
  Action: (p: { action: ToastAction; className: string; size: '2xs' | 'sm' }) => ReactNode;
  Dismiss: (p: { onDismiss?: (() => void) | undefined }) => ReactNode;
};

function ToastInner({
  tone = 'info',
  size = 'sm',
  title,
  description,
  icon,
  action,
  dismissible = true,
  parts,
  onDismiss,
}: ToastContentProps & { parts: Parts; onDismiss?: (() => void) | undefined }) {
  const iconNode =
    icon === false ? null : (
      <span
        aria-hidden
        data-slot="toast-icon"
        className={cn(
          'inline-flex shrink-0',
          ICON_TONE[tone],
          size === 'lg' ? '[&_svg]:size-5' : '[&_svg]:size-4',
        )}
      >
        {icon ?? DEFAULT_ICON[tone]}
      </span>
    );
  const actionNode = action ? (
    <parts.Action
      action={action}
      size={size === 'lg' ? 'sm' : '2xs'}
      className={size === 'lg' ? 'text-13 leading-19' : 'text-12 leading-14'}
    />
  ) : null;

  if (size === 'sm') {
    return (
      <>
        {iconNode}
        <parts.Title className="min-w-0 flex-1 text-13 leading-19 font-medium break-words">
          {title}
        </parts.Title>
        {actionNode}
        {dismissible ? <parts.Dismiss onDismiss={onDismiss} /> : null}
      </>
    );
  }
  return (
    <>
      {iconNode}
      <div data-slot="toast-content" className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-1 break-words">
          <parts.Title className="text-14 leading-20 font-medium">{title}</parts.Title>
          {description != null ? (
            <parts.Description className="text-14 leading-20 font-regular">
              {description}
            </parts.Description>
          ) : null}
        </div>
        {actionNode ? <div className="flex gap-1.5">{actionNode}</div> : null}
      </div>
      {dismissible ? <parts.Dismiss onDismiss={onDismiss} /> : null}
    </>
  );
}

const STATIC_PARTS: Parts = {
  Title: ({ className, children }) => (
    <p data-slot="toast-title" className={className}>
      {children}
    </p>
  ),
  Description: ({ className, children }) => (
    <p data-slot="toast-description" className={className}>
      {children}
    </p>
  ),
  Action: ({ action, className, size }) => (
    <Button variant="linkSecondary" size={size} className={className} onClick={action.onClick}>
      {action.label}
    </Button>
  ),
  Dismiss: ({ onDismiss }) => (
    <IconButton
      variant="tertiary"
      size="xs"
      icon={<XClose />}
      aria-label="Dismiss notification"
      onClick={onDismiss}
    />
  ),
};

/** The toast surface on its own, with no timers or live region: static previews and tests. */
export function ToastCard({
  className,
  onDismiss,
  ...props
}: ToastContentProps & { className?: string; onDismiss?: () => void }) {
  return (
    <div
      data-slot="toast"
      className={cn(toastVariants({ tone: props.tone, size: props.size }), className)}
    >
      <ToastInner {...props} parts={STATIC_PARTS} onDismiss={onDismiss} />
    </div>
  );
}

// ---- Live toasts --------------------------------------------------------------------------------

type ToastData = { size?: ToastSize; icon?: ReactNode | false; dismissible?: boolean };

const LIVE_PARTS: Parts = {
  Title: ({ className, children }) => (
    <ToastPrimitive.Title data-slot="toast-title" className={className}>
      {children}
    </ToastPrimitive.Title>
  ),
  Description: ({ className, children }) => (
    <ToastPrimitive.Description data-slot="toast-description" className={className}>
      {children}
    </ToastPrimitive.Description>
  ),
  // Base UI fills the action from the toast's `actionProps` (label as children, onClick).
  Action: ({ className, size }) => (
    <ToastPrimitive.Action
      render={<Button variant="linkSecondary" size={size} className={className} />}
    />
  ),
  Dismiss: () => (
    <ToastPrimitive.Close
      render={
        <IconButton
          variant="tertiary"
          size="xs"
          icon={<XClose />}
          aria-label="Dismiss notification"
        />
      }
    />
  ),
};

export type ToastProviderProps = ToastPrimitive.Provider.Props;

/** Holds the toast queue. Put it once near the app root, with a <Toaster /> inside. */
export function ToastProvider({ timeout = 5000, limit = 3, ...props }: ToastProviderProps) {
  return <ToastPrimitive.Provider timeout={timeout} limit={limit} {...props} />;
}

export type ToasterProps = {
  className?: string;
  /** Portal target, e.g. a ShadowRoot. Falls back to PortalContainerProvider, then document.body. */
  container?: PortalContainer;
};

/** Renders the live toasts, stacked bottom-right. */
export function Toaster({ className, container }: ToasterProps) {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>();
  const portalContainer = usePortalContainer(container);
  return (
    <ToastPrimitive.Portal container={portalContainer}>
      <ToastPrimitive.Viewport
        data-slot="toaster"
        className={cn(
          // Inset 16px on both sides so it never runs off a narrow screen; capped and right-aligned.
          'fixed inset-x-4 bottom-4 z-50 ml-auto flex max-w-97.5 flex-col items-end gap-2 outline-none',
          className,
        )}
      >
        {toasts.map((t) => {
          const tone = (TOAST_TONES as readonly string[]).includes(t.type ?? '')
            ? (t.type as ToastTone)
            : 'info';
          const size = t.data?.size ?? (t.description != null ? 'lg' : 'sm');
          return (
            <ToastPrimitive.Root
              key={t.id}
              toast={t}
              data-slot="toast"
              className={cn(
                toastVariants({ tone, size }),
                'outline-none transition-opacity focus-visible:focus-ring',
                'data-ending-style:opacity-0 data-starting-style:opacity-0',
              )}
            >
              <ToastInner
                tone={tone}
                size={size}
                title={t.title}
                description={t.description}
                icon={t.data?.icon}
                // Only marks that an action exists: LIVE_PARTS.Action reads label and handler from
                // the toast's actionProps.
                action={t.actionProps ? { label: null, onClick: () => {} } : undefined}
                dismissible={t.data?.dismissible ?? true}
                parts={LIVE_PARTS}
              />
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

export type ShowToastOptions = ToastContentProps & {
  id?: string;
  /** ms before it closes; 0 keeps it until dismissed. Defaults to the provider's timeout. */
  timeout?: number;
  /** `high` announces assertively (role="alert"). */
  priority?: 'low' | 'high';
  onClose?: () => void;
};

/** Raise, update and close toasts from anywhere under <ToastProvider>. */
export function useToast() {
  const manager = ToastPrimitive.useToastManager<ToastData>();
  return useMemo(
    () => ({
      show: ({
        tone,
        size,
        title,
        description,
        icon,
        action,
        dismissible,
        ...rest
      }: ShowToastOptions) =>
        manager.add({
          ...rest,
          type: tone ?? 'info',
          title,
          description,
          actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
          data: { size, icon, dismissible },
        }),
      close: (id?: string) => manager.close(id),
    }),
    [manager],
  );
}
