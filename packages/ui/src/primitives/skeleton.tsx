import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Shimmer (loading placeholder). Size it with width/height utilities to match the content it
 * stands in for. Purely visual: hidden from assistive tech, so the loading region should carry
 * aria-busy or a status message. The pulse stops under prefers-reduced-motion.
 */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn('rounded-6 bg-neutral-default motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}
