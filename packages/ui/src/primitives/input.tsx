import { Input as InputPrimitive } from '@base-ui/react/input';
import { SearchMd, XClose } from '@honey-ds/icons';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode, type Ref, useCallback, useRef, useState } from 'react';
import { cn } from '../lib/utils';

/**
 * Honey DS text field shell — Figma Text Input 185:378 and Search 6272:986.
 * States: hover/focus are pseudo-states; error comes from `aria-invalid`; disabled from `disabled`.
 * The border, ring and background live on the shell so icon slots sit inside the field.
 */
export const inputFieldVariants = cva(
  [
    'group/input flex w-full min-w-0 items-center gap-2 px-3 font-sans transition-colors',
    'border border-w-14 border-neutral-default bg-neutral-white text-neutral-strong',
    'hover:bg-neutral-subtle',
    'focus-within:border-focus focus-within:bg-neutral-white focus-within:focus-ring',
    'data-invalid:border-error-strong data-invalid:focus-ring-error',
    'data-invalid:focus-within:border-error-strong data-invalid:focus-within:focus-ring-error',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled data-disabled:hover:bg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-8 rounded-6 text-14 leading-20',
        md: 'min-h-10 rounded-8 text-14 leading-20',
        lg: 'min-h-11 rounded-8 text-16 leading-24',
      },
    },
    defaultVariants: { size: 'sm' },
  },
);

const inputElementClasses = [
  'min-w-0 flex-1 self-stretch bg-transparent text-inherit outline-none',
  'placeholder:text-neutral-subtle disabled:cursor-not-allowed disabled:placeholder:text-disabled',
  '[&::-webkit-search-cancel-button]:appearance-none',
];

const iconSlotClasses =
  'inline-flex shrink-0 text-fg-neutral-intense group-data-disabled/input:text-fg-disabled [&_svg]:size-4';

export type InputVariantProps = VariantProps<typeof inputFieldVariants>;

export type InputProps = Omit<InputPrimitive.Props, 'size' | 'className' | 'ref'> &
  InputVariantProps & {
    /** `search` adds the search icon, `type="search"` and a clear button once the field has a value. */
    variant?: 'text' | 'search';
    /** Class for the field shell (border, background, size). */
    className?: string;
    /** Class for the native <input>. */
    inputClassName?: string;
    ref?: Ref<HTMLInputElement>;
    /** Icon before the value. Defaults to the search icon for `variant="search"`. */
    leadingIcon?: ReactNode;
    /** Icon after the value (hidden while the search clear button shows). */
    trailingIcon?: ReactNode;
    /** Accessible name of the search clear button. */
    clearLabel?: string;
    /** Called after the search clear button empties the field. */
    onClear?: () => void;
  };

type InputChangeEvent = Parameters<NonNullable<InputPrimitive.Props['onChange']>>[0];

function isInvalid(value: unknown) {
  return value === true || value === 'true';
}

function setNativeValue(el: HTMLInputElement, value: string) {
  // Go through the prototype setter so React's value tracker sees the change and fires onChange.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function Input({
  className,
  inputClassName,
  size = 'sm',
  variant = 'text',
  leadingIcon,
  trailingIcon,
  clearLabel = 'Clear search',
  onClear,
  onChange,
  value,
  defaultValue,
  disabled,
  type,
  ref,
  ...props
}: InputProps) {
  const isSearch = variant === 'search';
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledFilled, setUncontrolledFilled] = useState(
    defaultValue != null && String(defaultValue) !== '',
  );
  const filled = value != null ? String(value) !== '' : uncontrolledFilled;

  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  const handleChange = (event: InputChangeEvent) => {
    setUncontrolledFilled(event.currentTarget.value !== '');
    onChange?.(event);
  };

  const handleClear = () => {
    const el = innerRef.current;
    if (!el) return;
    setNativeValue(el, '');
    el.focus();
    onClear?.();
  };

  const leading = leadingIcon ?? (isSearch ? <SearchMd /> : null);
  const showClear = isSearch && filled && !disabled;

  return (
    <div
      data-slot="input-field"
      data-invalid={isInvalid(props['aria-invalid']) ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn(inputFieldVariants({ size }), className)}
    >
      {leading ? (
        <span aria-hidden className={iconSlotClasses}>
          {leading}
        </span>
      ) : null}
      <InputPrimitive
        ref={setRefs}
        data-slot="input"
        type={type ?? (isSearch ? 'search' : 'text')}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={handleChange}
        className={cn(inputElementClasses, inputClassName)}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={handleClear}
          className={cn(
            iconSlotClasses,
            'items-center justify-center rounded-4 outline-none hover:text-fg-neutral-strong focus-visible:focus-ring',
          )}
        >
          <XClose aria-hidden />
        </button>
      ) : trailingIcon ? (
        <span aria-hidden className={iconSlotClasses}>
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
}
