import { ChevronDown, ChevronLeftDouble, ChevronRightDouble, Pin02 } from '@honey-ds/icons';
import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '../lib/utils';
import { Avatar } from '../primitives/avatar';
import { IconButton } from '../primitives/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../primitives/tooltip';

/**
 * Honey DS side navigation — Figma `HIG – Side Nav` 7767:777; Header, Section and Item follow
 * hiver-ui-kit's SideNav/*.figma-spec.md.
 *
 * A floating panel (white, radius 16, elevation sm) on the page background. Collapsed it is a 50px
 * icon rail; with `peek`, hovering it or tabbing into it widens it to 220px over the content, as the
 * prototype and the plan's narrow-screen behaviour do. The header button pins it open or closed.
 *
 * Omni theme: the spec's `background/accents/hig/*` hover/active fills are HIG's blue-grey. Omni uses
 * the shadcn sidebar mapping instead: hover `neutral/default`, active `neutral/strong`. Widths are
 * the manual layout tokens (50px collapsed, 220px expanded).
 */

type SideNavContextValue = {
  /** Drawn as the icon rail right now (pinned collapsed and not peeking). */
  collapsed: boolean;
  /** The pinned state the header button toggles. */
  pinnedCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Widen the rail for now, as hovering does, without changing the pinned state. */
  openTemporarily: () => void;
};
/** Hover this long before a collapsed rail peeks. */
const PEEK_DELAY_MS = 150;

const SideNavContext = createContext<SideNavContextValue>({
  collapsed: false,
  pinnedCollapsed: false,
  setCollapsed: () => {},
  openTemporarily: () => {},
});
const useSideNav = () => useContext(SideNavContext);

export type SideNavProps = Omit<ComponentProps<'nav'>, 'aria-label'> & {
  /** Controlled collapsed state. Omit to let the nav manage it. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** While collapsed, widen over the content on hover or keyboard focus. */
  peek?: boolean;
  /** Required: names the landmark, e.g. "Inboxes". */
  'aria-label': string;
};

export function SideNav({
  collapsed: collapsedProp,
  onCollapsedChange,
  peek = true,
  className,
  children,
  ...props
}: SideNavProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  // Opened by clicking a rail avatar: lasts until the pointer or focus leaves, like hovering.
  const [clicked, setClicked] = useState(false);
  const pinnedCollapsed = collapsedProp ?? uncontrolled;
  const peeking = pinnedCollapsed && (clicked || (peek && (hovered || keyboardFocus)));
  const collapsed = pinnedCollapsed && !peeking;
  // Set between pointerdown and the focus it causes, so a click never counts as keyboard focus.
  const pointerFocus = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const setCollapsed = (next: boolean) => {
    // Pinning or unpinning ends any peek: collapsing with the keyboard must visibly collapse.
    clearTimeout(hoverTimer.current);
    setHovered(false);
    setKeyboardFocus(false);
    setClicked(false);
    if (collapsedProp === undefined) setUncontrolled(next);
    onCollapsedChange?.(next);
  };
  return (
    <SideNavContext.Provider
      value={{ collapsed, pinnedCollapsed, setCollapsed, openTemporarily: () => setClicked(true) }}
    >
      <TooltipProvider>
        {/* Holds the rail's width in the layout, so peeking floats over the content. */}
        <div
          data-slot="side-nav-rail"
          className={cn(
            'relative h-full shrink-0 motion-safe:transition-[width] motion-safe:duration-150',
            pinnedCollapsed ? 'w-(--hds-layout-nav-collapsed)' : 'w-(--hds-layout-nav-expanded)',
          )}
        >
          <nav
            data-slot="side-nav"
            data-collapsed={collapsed || undefined}
            data-peeking={peeking || undefined}
            // A short delay before peeking, so crossing the rail on the way to the list doesn't
            // open it; leaving closes at once.
            onPointerEnter={() => {
              clearTimeout(hoverTimer.current);
              hoverTimer.current = setTimeout(() => setHovered(true), PEEK_DELAY_MS);
            }}
            onPointerLeave={() => {
              clearTimeout(hoverTimer.current);
              setHovered(false);
              setClicked(false);
            }}
            // Only keyboard focus peeks: a click on an item must not leave the rail stuck open.
            onPointerDown={() => {
              pointerFocus.current = true;
              setTimeout(() => (pointerFocus.current = false));
            }}
            onFocus={(e) => {
              if (!pointerFocus.current && e.target.matches(':focus-visible'))
                setKeyboardFocus(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setKeyboardFocus(false);
                setClicked(false);
              }
            }}
            className={cn(
              'absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden rounded-16 bg-neutral-white font-sans shadow-sm',
              'motion-safe:transition-[width,box-shadow] motion-safe:duration-150',
              collapsed ? 'w-(--hds-layout-nav-collapsed)' : 'w-(--hds-layout-nav-expanded)',
              peeking && 'shadow-lg',
              className,
            )}
            {...props}
          >
            {children}
          </nav>
        </div>
      </TooltipProvider>
    </SideNavContext.Provider>
  );
}

export type SideNavHeaderProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Product name shown next to the logo. Hidden when collapsed. */
  title?: ReactNode;
  logo?: ReactNode;
};

/** Logo, title and the collapse toggle. Collapsed, only the toggle remains. */
export function SideNavHeader({ title, logo, className, ...props }: SideNavHeaderProps) {
  const { collapsed, pinnedCollapsed, setCollapsed } = useSideNav();
  return (
    <div
      data-slot="side-nav-header"
      className={cn(
        'flex shrink-0 items-center gap-1.5 py-3',
        collapsed ? 'justify-center px-0' : 'px-3',
        className,
      )}
      {...props}
    >
      {collapsed ? null : (
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {logo ? <span className="inline-flex shrink-0">{logo}</span> : null}
          {title ? (
            <span className="truncate text-14 leading-20 font-medium text-neutral-strong">
              {title}
            </span>
          ) : null}
        </div>
      )}
      <IconButton
        size="xs"
        variant="tertiary"
        // While peeking the nav already looks open: the button keeps it that way.
        aria-label={
          !pinnedCollapsed
            ? 'Collapse navigation'
            : collapsed
              ? 'Expand navigation'
              : 'Keep navigation open'
        }
        aria-expanded={!pinnedCollapsed}
        icon={
          !pinnedCollapsed ? <ChevronLeftDouble /> : collapsed ? <ChevronRightDouble /> : <Pin02 />
        }
        onClick={() => setCollapsed(!pinnedCollapsed)}
      />
    </div>
  );
}

/** The enclosing section's title, so a collapsed item's tooltip can say which inbox it belongs to. */
const SideNavSectionContext = createContext<string | null>(null);

export type SideNavSectionProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Section label (an inbox name). On the rail it becomes the section's avatar and tooltip. */
  title: string;
  defaultOpen?: boolean;
  /** One of the section's views is the current page: the rail avatar gets the active fill. */
  active?: boolean;
};

/**
 * A titled group of items whose title toggles it. Figma draws the header as static text; it is a
 * disclosure button here so long inbox lists can fold.
 *
 * On the collapsed rail the section is a single avatar (the inbox's initials), as in the prototype:
 * repeating every view's icon per inbox makes inboxes impossible to tell apart. Clicking it, like
 * hovering, opens the nav for now to show the views; it never pins.
 */
export function SideNavSection({
  title,
  defaultOpen = true,
  active = false,
  className,
  children,
  ...props
}: SideNavSectionProps) {
  const { collapsed, openTemporarily } = useSideNav();
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  if (collapsed)
    return (
      <div
        data-slot="side-nav-section"
        role="group"
        aria-label={title}
        className={cn('flex shrink-0 justify-center py-1', className)}
        {...props}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                data-slot="side-nav-section-avatar"
                data-active={active || undefined}
                aria-label={title}
                // Opens the nav for now (like hovering); only the header button pins it.
                onClick={() => {
                  setOpen(true);
                  openTemporarily();
                }}
                className="inline-flex size-8 items-center justify-center rounded-8 outline-none transition-colors hover:bg-neutral-default focus-visible:focus-ring data-active:bg-neutral-strong"
              />
            }
          >
            <span aria-hidden className="inline-flex">
              <Avatar name={title} size="xs" shape="rounded" background="subtle" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
      </div>
    );
  return (
    <div
      data-slot="side-nav-section"
      role="group"
      aria-label={title}
      className={cn('flex shrink-0 flex-col gap-0.5 py-1', className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="mx-1.5 flex items-center gap-1 rounded-6 py-1 pr-3 pl-2.5 text-left text-12 leading-18 font-medium text-neutral-soft outline-none hover:text-neutral-default focus-visible:focus-ring"
      >
        <span className="min-w-0 flex-1 truncate" title={title}>
          {title}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            'size-3.5 shrink-0 motion-safe:transition-transform',
            open ? '' : '-rotate-90',
          )}
        />
      </button>
      {open ? (
        <div id={listId} className="flex flex-col gap-0.5">
          <SideNavSectionContext.Provider value={title}>{children}</SideNavSectionContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

export type SideNavItemProps = Omit<ComponentProps<'a'>, 'children'> & {
  /** 16px leading icon, from @honey-ds/icons. Collapsed, the item is this icon alone. Nested items
   *  (inside a SideNavSubmenu) go without, indented under their parent as in the prototype. */
  icon?: ReactNode;
  /** Trailing count (conversations in the view). */
  count?: number | string;
  /** The current view: aria-current="page" and the active fill. */
  active?: boolean;
  /** Render a router link instead of <a>, e.g. `render={<Link to="/my-work" />}`. */
  render?: ReactElement;
  /** The label. Keep it a string: collapsed, it becomes the accessible name and the tooltip. */
  children: ReactNode;
};

export function SideNavItem({
  icon,
  count,
  active = false,
  render,
  className,
  children,
  ...props
}: SideNavItemProps) {
  const { collapsed } = useSideNav();
  const section = useContext(SideNavSectionContext);
  const label = typeof children === 'string' ? children : undefined;
  const hasCount = count !== undefined && count !== null && count !== '';
  const element = useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...props,
      'data-slot': 'side-nav-item',
      'data-active': active || undefined,
      'aria-current': active ? 'page' : undefined,
      // Collapsed, the visible label is gone: name the link (with its count) instead.
      'aria-label':
        collapsed && label ? (hasCount ? `${label}, ${count}` : label) : props['aria-label'],
      className: cn(
        // shrink-0: a long nav scrolls (SideNavContent) instead of squashing items.
        'mx-1.5 flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-8 text-14 leading-20 font-regular text-neutral-default no-underline outline-none',
        'transition-colors hover:bg-neutral-default focus-visible:focus-ring',
        'data-active:bg-neutral-strong data-active:text-neutral-strong',
        collapsed ? 'justify-center px-0' : 'px-2',
        className,
      ),
      children: (
        <>
          {icon ? (
            <span
              aria-hidden
              className="inline-flex shrink-0 text-fg-neutral-bold-soft [&_svg]:size-4"
            >
              {icon}
            </span>
          ) : null}
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1 truncate">{children}</span>
              {hasCount ? (
                <span className="shrink-0 text-12 leading-18 font-medium tabular-nums">
                  {count}
                </span>
              ) : null}
            </>
          )}
        </>
      ),
    },
  });
  if (!collapsed || !label) return element;
  return (
    <Tooltip>
      <TooltipTrigger render={element} />
      {/* Collapsed, every inbox shows the same icons: the tooltip names the inbox too. The group
          label already gives screen readers the inbox. */}
      <TooltipContent side="right">{section ? `${section} · ${label}` : label}</TooltipContent>
    </Tooltip>
  );
}

export type SideNavSubmenuProps = {
  /** 16px leading icon, from @honey-ds/icons. */
  icon: ReactNode;
  /** The label; collapsed, it becomes the tooltip. */
  label: string;
  defaultOpen?: boolean;
  /** Nested SideNavItems. Rendered only while open, so they can load on demand. */
  children: ReactNode;
};

/**
 * An item that unfolds nested items, e.g. an inbox's "By tags". On the collapsed rail, opening it
 * pins the nav open, since nested items need their labels.
 */
export function SideNavSubmenu({
  icon,
  label,
  defaultOpen = false,
  children,
}: SideNavSubmenuProps) {
  const { collapsed, setCollapsed } = useSideNav();
  const section = useContext(SideNavSectionContext);
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  const button = (
    <button
      type="button"
      data-slot="side-nav-submenu"
      aria-expanded={open && !collapsed}
      aria-controls={open && !collapsed ? listId : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={() => {
        if (collapsed) {
          setCollapsed(false);
          setOpen(true);
        } else setOpen(!open);
      }}
      className={cn(
        'mx-1.5 flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-8 text-left text-14 leading-20 font-regular text-neutral-default outline-none',
        'transition-colors hover:bg-neutral-default focus-visible:focus-ring',
        collapsed ? 'justify-center px-0' : 'px-2',
      )}
    >
      <span aria-hidden className="inline-flex shrink-0 text-fg-neutral-bold-soft [&_svg]:size-4">
        {icon}
      </span>
      {collapsed ? null : (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              'size-3.5 shrink-0 text-fg-neutral-bold-soft motion-safe:transition-transform',
              open ? '' : '-rotate-90',
            )}
          />
        </>
      )}
    </button>
  );
  return (
    <>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={button} />
          <TooltipContent side="right">{section ? `${section} · ${label}` : label}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      {open && !collapsed ? (
        <div id={listId} className="flex flex-col gap-0.5 pl-4">
          {children}
        </div>
      ) : null}
    </>
  );
}

/** Bottom area: theme toggle, shortcuts and link-outs. */
export function SideNavFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="side-nav-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-col gap-0.5 border-t border-neutral-subtle py-2',
        className,
      )}
      {...props}
    />
  );
}

/** Scrolling middle area between the header and the footer. */
export function SideNavContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="side-nav-content"
      className={cn('flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-1', className)}
      {...props}
    />
  );
}
