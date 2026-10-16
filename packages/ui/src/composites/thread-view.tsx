import { ChevronDown } from '@honey-ds/icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { EmailFrame } from './email-frame';

export interface ThreadMessage {
  id: string;
  from: string;
  /** Already formatted, e.g. "Oct 3, 09:14". */
  sentAt: string;
  /** One line shown while the message is collapsed. */
  preview: string;
  html: string;
}

export interface ThreadViewProps {
  messages: ThreadMessage[];
  /** Controlled set of expanded message ids. */
  expandedIds?: ReadonlySet<string>;
  /** Uncontrolled start: these ids expanded. Defaults to the last message. */
  defaultExpandedIds?: readonly string[];
  onToggle?: (id: string, expanded: boolean) => void;
  /** Heading level of each message header, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  'aria-label'?: string;
  className?: string;
}

// Estimates only steer the first layout; real heights come from measureElement.
const COLLAPSED_ESTIMATE = 64;
const EXPANDED_ESTIMATE = 320;

/**
 * Week-2 rendering spike: a long thread where collapsed messages are text previews and only
 * expanded messages near the viewport mount an email iframe.
 *
 * - Virtualized with TanStack Virtual: rows are keyed by message id and measured with
 *   measureElement, so a row's height is remembered across scroll and remount.
 * - Email frame heights are also cached per message id and handed back as `initialHeight`, so a
 *   remounting frame starts at its real height instead of growing from the placeholder.
 * - Scroll anchoring: when a row above the viewport changes height (a frame loading or resizing
 *   while you scroll up), TanStack Virtual's default `shouldAdjustScrollPositionOnItemSizeChange`
 *   shifts scrollTop by the same delta, so what you're reading doesn't move.
 */
export function ThreadView({
  messages,
  expandedIds,
  defaultExpandedIds,
  onToggle,
  headingLevel = 3,
  'aria-label': ariaLabel = 'Conversation thread',
  className,
}: ThreadViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const heights = useRef(new Map<string, number>());
  const [uncontrolled, setUncontrolled] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedIds ?? (messages.length ? [messages.at(-1)!.id] : [])),
  );
  const expanded = expandedIds ?? uncontrolled;

  // React Compiler skips this component (react-hooks/incompatible-library): useVirtualizer returns
  // functions that must not be memoized. Expected for TanStack Virtual.
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: (i) => messages[i]!.id,
    estimateSize: (i) => {
      const m = messages[i]!;
      if (!expanded.has(m.id)) return COLLAPSED_ESTIMATE;
      return (heights.current.get(m.id) ?? EXPANDED_ESTIMATE) + COLLAPSED_ESTIMATE;
    },
    overscan: 4,
  });

  // Open on the latest message, as mail clients do: in a long thread it is far below the fold.
  useLayoutEffect(() => {
    if (messages.length) virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    // Once, on mount; later messages arriving don't yank the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = !expanded.has(id);
      if (!expandedIds) {
        setUncontrolled((prev) => {
          const s = new Set(prev);
          if (next) s.add(id);
          else s.delete(id);
          return s;
        });
      }
      onToggle?.(id, next);
    },
    [expanded, expandedIds, onToggle],
  );

  const items = virtualizer.getVirtualItems();
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      ref={scrollRef}
      data-slot="thread-view"
      // Focusable so keyboard users can scroll it (axe scrollable-region-focusable).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll container, see above
      tabIndex={0}
      aria-label={ariaLabel}
      role="region"
      className={cn('relative overflow-y-auto outline-none focus-visible:focus-ring', className)}
    >
      <div
        role="list"
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {items.map((item) => {
          const m = messages[item.index]!;
          const open = expanded.has(m.id);
          const bodyId = `msg-${m.id}`;
          return (
            <div
              key={item.key}
              role="listitem"
              aria-posinset={item.index + 1}
              aria-setsize={messages.length}
              data-index={item.index}
              data-message-id={m.id}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full px-4 py-1"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <article className="rounded-12 border border-w-14 border-neutral-soft bg-neutral-white font-sans">
                <Heading className="m-0">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={open ? bodyId : undefined}
                    onClick={() => toggle(m.id)}
                    className="flex w-full items-center gap-3 rounded-12 px-4 py-3 text-left outline-none hover:bg-neutral-subtle focus-visible:focus-ring"
                  >
                    <span className="shrink-0 text-14 leading-20 font-medium text-neutral-strong">
                      {m.from}
                    </span>
                    {open ? (
                      <span className="min-w-0 flex-1" />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-14 leading-20 text-neutral-soft">
                        {m.preview}
                      </span>
                    )}
                    <span className="shrink-0 text-12 leading-18 text-neutral-soft">
                      {m.sentAt}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        'size-4 shrink-0 text-fg-neutral-bold-soft',
                        open ? '' : '-rotate-90',
                      )}
                    />
                  </button>
                </Heading>
                {open ? (
                  <div id={bodyId} className="px-4 pb-4">
                    <EmailFrame
                      html={m.html}
                      title={`Email from ${m.from}, ${m.sentAt}`}
                      initialHeight={heights.current.get(m.id)}
                      onHeight={(h) => heights.current.set(m.id, h)}
                    />
                  </div>
                ) : null}
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
