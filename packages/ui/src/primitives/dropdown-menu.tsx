import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Check, ChevronRight } from '@honey-ds/icons';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { type PortalContainer, usePortalContainer } from '../lib/portal';
import { cn } from '../lib/utils';

/**
 * Honey DS Dropdown menu — Figma `Dropdown menu` 6003:8485 (shell) + `List Item` 6003:3745 (rows).
 * Shell, rows and per-state tokens follow hiver-ui-kit's DropdownMenu / ListItem figma-spec.md.
 * Keyboard behaviour (arrows, typeahead, Home/End, Escape, focus return) comes from Base UI Menu.
 *
 * The Figma footer (`actionButtons`: Cancel/Apply buttons) is deliberately absent: buttons are not valid
 * children of role="menu". A picker with confirm buttons belongs on a Popover, not a Menu.
 *
 * Elevation: Figma's `elevation/md` is the `shadow-md` token (manual until design exports effect
 * styles), on the menu and its submenus, plus the 1px `border/neutral/subtle` outline.
 */

export function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/** Renders a <button> by default; pass `render={<Button … />}` to use the DS button. */
export function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

export type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding'
  > & {
    /** Title row above the list (Figma `Type=Default` header, `title` toggle). */
    title?: ReactNode;
    /** Portal target, e.g. a ShadowRoot. Falls back to PortalContainerProvider, then document.body. */
    container?: PortalContainer;
  };

/** Positioner + popup shell: white paper, 1px subtle border, radius/8, list body padded spacing/2. */
export function DropdownMenuContent({
  className,
  children,
  title,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  collisionPadding,
  container,
  ...props
}: DropdownMenuContentProps) {
  const portalContainer = usePortalContainer(container);
  return (
    <MenuPrimitive.Portal container={portalContainer}>
      <MenuPrimitive.Positioner
        className="z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'flex max-h-(--available-height) min-w-40 flex-col overflow-hidden outline-none',
            'rounded-8 border border-w-14 border-neutral-subtle bg-neutral-white font-sans text-neutral-strong shadow-md',
            'origin-(--transform-origin) transition-opacity duration-100',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
            className,
          )}
          {...props}
        >
          {title != null ? (
            <div
              data-slot="dropdown-menu-title"
              className="flex min-h-10 shrink-0 items-center gap-2 border-b border-neutral-subtle px-3 text-14 leading-20 font-medium text-neutral-strong"
            >
              {title}
            </div>
          ) : null}
          <div
            data-slot="dropdown-menu-body"
            className="flex min-h-0 flex-col gap-1 overflow-y-auto p-2"
          >
            {children}
          </div>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

/**
 * List Item row: padding + gap spacing/1_5, radius/6, body/md/regular. States: highlighted (hover or
 * keyboard) → background/neutral/soft; selected/checked → background/info/subtle + info text and icons;
 * disabled → opacity 40 per spec.
 */
export const dropdownMenuItemVariants = cva(
  [
    'group/menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-6 p-1.5 select-none outline-none',
    'text-14 leading-20 font-regular text-neutral-strong',
    'data-highlighted:bg-neutral-soft',
    'data-checked:bg-info-subtle data-checked:text-info-default',
    'data-disabled:pointer-events-none data-disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-error-default data-highlighted:bg-error-subtle',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const ICON_SLOT = cn(
  'inline-flex size-5 shrink-0 items-center justify-center text-fg-neutral-bold-soft [&_svg]:size-4',
  'group-data-checked/menu-item:text-fg-info-default',
);

function LeadingIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden data-slot="dropdown-menu-item-icon" className={ICON_SLOT}>
      {children}
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span data-slot="dropdown-menu-item-label" className="min-w-0 flex-1 truncate">
      {children}
    </span>
  );
}

type ItemSlots = {
  /** Leading 20×20 icon wrap (16px glyph). Pass an @honey-ds/icons element. */
  icon?: ReactNode;
  /** Trailing content after the label, e.g. <DropdownMenuShortcut>. */
  trailing?: ReactNode;
};

export type DropdownMenuItemProps = MenuPrimitive.Item.Props &
  ItemSlots & {
    variant?: 'default' | 'destructive';
    /** Persistent selected state (Figma `State=Selected`), e.g. the current choice in an action menu. */
    selected?: boolean;
  };

export function DropdownMenuItem({
  className,
  variant = 'default',
  selected = false,
  icon,
  trailing,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-checked={selected || undefined}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
      {...props}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <Label>{children}</Label>
      {trailing}
    </MenuPrimitive.Item>
  );
}

function CheckGlyph() {
  return (
    <span aria-hidden className={ICON_SLOT}>
      <Check size={16} />
    </span>
  );
}

export type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props & ItemSlots;

/** Multi-select row. Checked rows take the Selected treatment plus a trailing check. */
export function DropdownMenuCheckboxItem({
  className,
  icon,
  trailing,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(dropdownMenuItemVariants(), className)}
      {...props}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <Label>{children}</Label>
      {trailing}
      <MenuPrimitive.CheckboxItemIndicator keepMounted className="data-unchecked:invisible">
        <CheckGlyph />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

export type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props & ItemSlots;

/** Single-select row inside a DropdownMenuRadioGroup. */
export function DropdownMenuRadioItem({
  className,
  icon,
  trailing,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(dropdownMenuItemVariants(), className)}
      {...props}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <Label>{children}</Label>
      {trailing}
      <MenuPrimitive.RadioItemIndicator keepMounted className="data-unchecked:invisible">
        <CheckGlyph />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

export type DropdownMenuSubTriggerProps = MenuPrimitive.SubmenuTrigger.Props &
  Pick<ItemSlots, 'icon'>;

export function DropdownMenuSubTrigger({
  className,
  icon,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(dropdownMenuItemVariants(), 'data-popup-open:bg-neutral-soft', className)}
      {...props}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <Label>{children}</Label>
      <span aria-hidden className={ICON_SLOT}>
        <ChevronRight size={16} />
      </span>
    </MenuPrimitive.SubmenuTrigger>
  );
}

/** Submenu popup: opens to the right, aligned so its first row lines up with the trigger row. */
export function DropdownMenuSubContent({
  side = 'right',
  sideOffset = 4,
  alignOffset = -9,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      side={side}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      {...props}
    />
  );
}

/** Group heading inside the list. Not in the Figma set; styled as body/xs/medium in text/neutral/soft. */
export function DropdownMenuLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn('px-1.5 pt-1 text-12 leading-18 font-medium text-neutral-soft', className)}
      {...props}
    />
  );
}

/** Figma `Type=Divider` row: 1px border/neutral/subtle rule inset spacing/1_5, spacing/1 above and below. */
export function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('mx-1.5 my-1 h-0 shrink-0 border-t border-neutral-subtle', className)}
      {...props}
    />
  );
}

/** Trailing keyboard hint. Not in the Figma set; body/xs in text/neutral/soft. */
export function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('ml-auto shrink-0 pl-2 text-12 leading-18 text-neutral-soft', className)}
      {...props}
    />
  );
}
