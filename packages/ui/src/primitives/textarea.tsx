import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS Text area — Figma component set 5095:755 (same visual language as the text Input).
 * Size only changes min-height and type; error comes from `aria-invalid`, disabled from `disabled`.
 */
export const textareaVariants = cva(
  [
    'block w-full min-w-0 resize-y rounded-8 px-3 py-2 font-sans outline-none transition-colors',
    'border border-w-14 border-neutral-default bg-neutral-white text-neutral-strong placeholder:text-neutral-subtle',
    'hover:bg-neutral-subtle',
    'focus-visible:border-focus focus-visible:bg-neutral-white focus-visible:focus-ring',
    'aria-invalid:border-error-strong aria-invalid:focus-ring-error',
    'aria-invalid:focus-visible:border-error-strong aria-invalid:focus-visible:focus-ring-error',
    'disabled:cursor-not-allowed disabled:resize-none disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled disabled:hover:bg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-24 text-14 leading-20',
        md: 'min-h-24 text-14 leading-20',
        lg: 'min-h-30 text-16 leading-24',
      },
    },
    defaultVariants: { size: 'sm' },
  },
);

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'size'> &
  VariantProps<typeof textareaVariants>;

export function Textarea({ className, size = 'sm', ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ size }), className)}
      {...props}
    />
  );
}
