import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva } from 'class-variance-authority';
import { createContext, type ReactNode, useContext } from 'react';
import { cn } from '../lib/utils';
import { Badge } from './badge';

/**
 * Honey DS Tabs — Figma TabItem component set 376:1733 (Variant underline | pill × Active × State).
 * Tokens follow hiver-ui-kit's Tab/Item figma-spec.md. Keyboard (arrow keys, Home/End) and roles come
 * from Base UI. Deviation: an inactive tab's label turns text/neutral/default on hover, because
 * Figma's text/neutral/soft on background/neutral/soft is 4.35:1 (below 4.5:1).
 */
export type TabsVariant = 'underline' | 'pill';

const TabsVariantContext = createContext<TabsVariant>('underline');

export const tabsTriggerVariants = cva(
  [
    'group/tab relative inline-flex min-w-12.5 shrink-0 cursor-pointer items-center justify-center gap-1.5 px-3',
    'whitespace-nowrap font-sans text-14 leading-20 font-medium outline-none select-none transition-colors',
    'focus-visible:focus-ring data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:size-4',
  ],
  {
    variants: {
      variant: {
        underline: [
          'py-2.5 text-neutral-soft hover:bg-neutral-soft hover:text-neutral-default',
          'data-active:text-neutral-default data-active:hover:bg-neutral-default',
          // Figma's 2px full-width indicator under the active tab.
          'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full',
          'data-active:after:bg-neutral-bold-intense',
        ],
        pill: [
          'rounded-6 py-1.5 text-neutral-soft hover:bg-neutral-soft hover:text-neutral-default',
          'data-active:bg-neutral-subtle data-active:text-neutral-strong data-active:shadow-xs',
          'data-active:hover:bg-neutral-soft',
        ],
      },
    },
    defaultVariants: { variant: 'underline' },
  },
);

export type TabsProps = TabsPrimitive.Root.Props;

/** Holds the selected value. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). */
export function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  );
}

export type TabsListProps = TabsPrimitive.List.Props & {
  /** Figma `Variant`: underline (page/section tabs) or pill (compact switchers). */
  variant?: TabsVariant;
};

/** Arrow keys select as they move (automatic activation), since our panels render without a fetch delay. */
export function TabsList({
  className,
  variant = 'underline',
  activateOnFocus = true,
  ...props
}: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        activateOnFocus={activateOnFocus}
        className={cn('flex items-center', variant === 'pill' ? 'gap-1' : 'gap-0', className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

export type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, 'children'> & {
  /** Leading 16px icon. Pass an @honey-ds/icons component element. */
  icon?: ReactNode;
  /** Trailing count (Figma `badge`), e.g. unread conversations. */
  count?: ReactNode;
  children?: ReactNode;
};

export function TabsTrigger({ className, icon, count, children, ...props }: TabsTriggerProps) {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    >
      {icon ? (
        <span aria-hidden data-slot="tabs-trigger-icon" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
      {count != null ? (
        <Badge size="xs" data-slot="tabs-trigger-count">
          {count}
        </Badge>
      ) : null}
    </TabsPrimitive.Tab>
  );
}

export type TabsContentProps = TabsPrimitive.Panel.Props;

/** The panel for one tab. Hidden while its tab is not selected. */
export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('outline-none focus-visible:focus-ring', className)}
      {...props}
    />
  );
}
