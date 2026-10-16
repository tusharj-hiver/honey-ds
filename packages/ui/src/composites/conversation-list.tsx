import { AlarmClock, MessageChatCircle, Paperclip, Stars01 } from '@honey-ds/icons';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Skeleton } from '../primitives/skeleton';
import { cn } from '../lib/utils';

/**
 * Conversation list: one-line rows in a listbox with roving focus (implementation plan §2.3).
 *
 * Design gap: Figma's Conversation card (5485:2399) is the multi-line card; the one-line list variant
 * the plan specifies doesn't exist in Figma yet. Spacing and type follow the prototype's list rows
 * (14/20 sender and subject, 12/18 time, 8px unread dot, royal selection with a left accent).
 *
 * Arrow keys, Home and End move focus only (handled on the listbox); Enter, Space or a click on a
 * row selects it (calls onValueChange).
 *
 * Virtualized: only the rows in view (plus a few) are in the DOM, so an inbox of thousands scrolls
 * like one of ten. Each row gets its own `selected` and tab-stop props and is memoized, so moving
 * the selection re-renders the two rows involved, not the list. Keyboard focus that moves to a row
 * not rendered yet scrolls it in first, then focuses it.
 */

/** Estimated row height (--hds-layout-row); rows are measured once rendered. */
const ROW_ESTIMATE = 40;
/** Ask for more when this close to the end. */
const END_THRESHOLD = 5;

export type ConversationListProps = {
  'aria-label': string;
  rows: readonly ConversationRowProps[];
  /** Id of the selected (open) conversation. */
  value: string | null;
  onValueChange: (id: string) => void;
  /** A row was pointed at or focused, so it may be opened next: a cue to start loading it. */
  onPreview?: (id: string) => void;
  /** Called when the last rows scroll into view: load the next page. */
  onEndReached?: () => void;
  /** Rendered after the rows inside the scroller, e.g. a skeleton while the next page loads. */
  footer?: ReactNode;
  className?: string;
};

export function ConversationList({
  'aria-label': ariaLabel,
  rows,
  value,
  onValueChange,
  onPreview,
  onEndReached,
  footer,
  className,
}: ConversationListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<number | null>(null);

  // Handlers given to rows must not change between renders, or every memoized row re-renders.
  const latest = useRef({ onValueChange, onPreview, onEndReached });
  latest.current = { onValueChange, onPreview, onEndReached };
  const onSelect = useCallback((id: string) => latest.current.onValueChange(id), []);
  const previewed = useRef<string | null>(null);
  const onFocusRow = useCallback((id: string) => {
    setFocused(id);
    if (id !== previewed.current) {
      previewed.current = id;
      latest.current.onPreview?.(id);
    }
  }, []);

  const indexOf = (id: string | null) => (id === null ? -1 : rows.findIndex((r) => r.id === id));
  // The tab stop is the last focused row, else the selected row, else the first row.
  const tabStop =
    indexOf(focused) >= 0 ? focused : indexOf(value) >= 0 ? value : (rows[0]?.id ?? null);
  const tabStopIndex = indexOf(tabStop);

  // React Compiler skips this component (react-hooks/incompatible-library): useVirtualizer returns
  // functions that must not be memoized. Expected for TanStack Virtual.
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: (i) => rows[i]!.id,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 8,
    // The tab-stop row is always rendered, even scrolled far away, so Tab can always reach the
    // list and a focused row never unmounts under the keyboard.
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      return tabStopIndex < 0 || indexes.includes(tabStopIndex)
        ? indexes
        : [...indexes, tabStopIndex].sort((a, b) => a - b);
    },
  });
  const items = virtualizer.getVirtualItems();

  // Keep the open row in view when it changes from outside the list (j/k, a link).
  const selectedIndex = indexOf(value);
  useEffect(() => {
    if (selectedIndex >= 0) virtualizer.scrollToIndex(selectedIndex, { align: 'auto' });
    // Only when the selection moves, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  // Ask for the next page once the end is near.
  // The visible range, not the rendered items: the tab-stop row may be rendered far from it.
  const lastIndex = virtualizer.range?.endIndex ?? -1;
  useEffect(() => {
    if (rows.length && lastIndex >= rows.length - END_THRESHOLD) latest.current.onEndReached?.();
  }, [lastIndex, rows.length]);

  // Focus a row that keyboard navigation scrolled into view, once it is rendered.
  useLayoutEffect(() => {
    if (pendingFocus === null) return;
    const id = rows[pendingFocus]?.id;
    const el = id
      ? scrollRef.current?.querySelector<HTMLElement>(
          `[role="option"][data-id="${CSS.escape(id)}"]`,
        )
      : null;
    if (el) {
      el.focus();
      setPendingFocus(null);
    }
    // `items` changes when the virtualizer renders the scrolled-to row.
  }, [pendingFocus, rows, items]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    const index = indexOf(current?.dataset.id ?? null);
    if (index < 0) return;
    let next: number;
    if (event.key === 'ArrowDown') next = Math.min(index + 1, rows.length - 1);
    else if (event.key === 'ArrowUp') next = Math.max(index - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = rows.length - 1;
    else return;
    event.preventDefault();
    virtualizer.scrollToIndex(next, { align: 'auto' });
    setPendingFocus(next);
  };

  return (
    <div
      ref={scrollRef}
      role="listbox"
      aria-label={ariaLabel}
      // Rows are the tab stops (roving focus); the listbox itself is only focusable by script.
      tabIndex={-1}
      data-slot="conversation-list"
      onKeyDown={onKeyDown}
      onPointerOver={(e) => {
        const id = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]')?.dataset.id;
        if (id && id !== previewed.current) {
          previewed.current = id;
          onPreview?.(id);
        }
      }}
      className={cn('min-h-0 overflow-y-auto overscroll-contain font-sans', className)}
    >
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {items.map((item) => {
          const row = rows[item.index]!;
          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <ConversationRow
                {...row}
                selected={row.id === value}
                tabbable={row.id === tabStop}
                position={item.index + 1}
                size={rows.length}
                onSelect={onSelect}
                onFocusRow={onFocusRow}
              />
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}

export type ConversationRowProps = {
  id: string;
  sender: string;
  /** The subject, or the latest message when there is none. */
  subject: string;
  /** Already formatted for display, e.g. "1h". */
  time: string;
  /** ISO timestamp behind `time`. */
  dateTime: string;
  unread?: boolean;
  sla?: 'overdue' | 'duesoon' | null;
  /** AI has something for this conversation (summary, draft or suggestion). */
  ai?: boolean;
  attachment?: boolean;
  channel?: 'email' | 'chat';
  className?: string;
};

type RowState = {
  selected: boolean;
  /** The one row Tab lands on (roving focus). */
  tabbable: boolean;
  /** 1-based position and list size, since only some rows are in the DOM. */
  position: number;
  size: number;
  onSelect: (id: string) => void;
  onFocusRow: (id: string) => void;
};

const ConversationRow = memo(function ConversationRow({
  id,
  sender,
  subject,
  time,
  dateTime,
  unread = false,
  sla = null,
  ai = false,
  attachment = false,
  channel = 'email',
  className,
  selected,
  tabbable,
  position,
  size,
  onSelect,
  onFocusRow,
}: ConversationRowProps & RowState) {
  // Icons are decorative. The accessible name is the visible text plus visually hidden words for what
  // the icons show, in reading order, so it still contains the visible text (for voice control).
  const extras = [
    unread && 'unread',
    channel === 'chat' && 'chat',
    sla === 'overdue' && 'SLA overdue',
    sla === 'duesoon' && 'SLA due soon',
    attachment && 'has attachment',
  ].filter(Boolean);

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-posinset={position}
      aria-setsize={size}
      tabIndex={tabbable ? 0 : -1}
      data-id={id}
      data-slot="conversation-row"
      data-unread={unread || undefined}
      onFocus={() => onFocusRow(id)}
      onClick={(event) => {
        onSelect(id);
        event.currentTarget.focus();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect(id);
      }}
      className={cn(
        'group relative flex h-(--hds-layout-row) w-full shrink-0 cursor-pointer items-center gap-2 px-4 outline-none select-none',
        'transition-colors hover:bg-neutral-subtle focus-visible:z-10 focus-visible:focus-ring',
        'aria-selected:bg-royal-subtle aria-selected:hover:bg-royal-subtle',
        // Left accent on the selected row (prototype: 1.7px royal-strong border).
        'aria-selected:before:absolute aria-selected:before:inset-y-0 aria-selected:before:left-0 aria-selected:before:w-0.5 aria-selected:before:bg-royal-strong',
        className,
      )}
    >
      <span aria-hidden className="flex size-2 shrink-0 items-center justify-center">
        {unread ? <span className="size-2 rounded-full bg-button" /> : null}
      </span>
      {channel === 'chat' ? (
        <MessageChatCircle aria-hidden className="size-4 shrink-0 text-fg-neutral-bold-soft" />
      ) : null}
      <span
        title={sender}
        className={cn(
          'max-w-2/5 shrink-0 truncate text-14 leading-20',
          unread ? 'font-semibold text-neutral-strong' : 'font-medium text-neutral-default',
        )}
      >
        {sender}
      </span>
      <span
        title={subject}
        className={cn(
          'min-w-0 flex-1 truncate text-14 leading-20',
          unread
            ? 'font-medium text-neutral-strong'
            : // neutral/soft is 4.24:1 on the selected (royal/subtle) background, so it darkens there.
              'font-regular text-neutral-soft group-aria-selected:text-neutral-default',
        )}
      >
        {subject}
      </span>
      {/* Flex items are separated by spaces in the accessible name, so no separators are needed. */}
      {extras.length ? <span className="sr-only">{extras.join(', ')}</span> : null}
      <span aria-hidden className="flex shrink-0 items-center gap-1.5 [&_svg]:size-4">
        {sla ? (
          <AlarmClock
            data-sla={sla}
            className={sla === 'overdue' ? 'text-fg-error-default' : 'text-fg-warning-default'}
          />
        ) : null}
        {ai ? <Stars01 className="text-fg-royal-default" /> : null}
        {attachment ? <Paperclip className="text-fg-neutral-bold-soft" /> : null}
      </span>
      <time
        dateTime={dateTime}
        className="shrink-0 text-12 leading-18 font-regular text-neutral-soft group-aria-selected:text-neutral-default"
      >
        {time}
      </time>
    </div>
  );
});

/** A loading placeholder the height of a row. Render a dozen while the first page loads. */
export function ConversationRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-slot="conversation-row-skeleton"
      className={cn('flex h-(--hds-layout-row) w-full shrink-0 items-center gap-2 px-4', className)}
    >
      <span className="size-2 shrink-0" />
      <Skeleton className="h-3 w-24 shrink-0" />
      <Skeleton className="h-3 min-w-0 flex-1" />
      <Skeleton className="h-3 w-6 shrink-0" />
    </div>
  );
}
