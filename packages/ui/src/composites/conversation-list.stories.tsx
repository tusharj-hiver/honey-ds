import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import {
  ConversationList,
  type ConversationRowProps,
  ConversationRowSkeleton,
} from './conversation-list';

const ROWS: ConversationRowProps[] = [
  {
    id: 'c1',
    sender: 'Darlene Robertson',
    subject: '401 Unauthorized on /v2/auth/token in production',
    time: '1h',
    dateTime: '2026-10-12T08:00:00Z',
    unread: true,
    sla: 'duesoon',
    ai: true,
  },
  {
    id: 'c2',
    sender: 'Bessie Cooper',
    subject: 'Invoice INV-20491 charged twice this month',
    time: '2h',
    dateTime: '2026-10-12T07:00:00Z',
    unread: true,
    sla: 'overdue',
    attachment: true,
  },
  {
    id: 'c3',
    sender: 'Albert Flores',
    subject: 'Can we move our renewal date to the 1st?',
    time: '3h',
    dateTime: '2026-10-12T06:00:00Z',
  },
  {
    id: 'c4',
    sender: 'Annette Black',
    subject: 'Webhook retries keep failing after the IP allowlist change',
    time: '5h',
    dateTime: '2026-10-12T04:00:00Z',
    ai: true,
  },
  {
    id: 'c5',
    sender: 'Jacob Jones',
    subject: 'Hi, is anyone there? I need help with my order',
    time: '6h',
    dateTime: '2026-10-12T03:00:00Z',
    unread: true,
    channel: 'chat',
  },
  {
    id: 'c6',
    sender: 'Cameron Williamson',
    subject: 'Export to CSV drops the custom fields columns',
    time: '1d',
    dateTime: '2026-10-11T09:00:00Z',
    attachment: true,
  },
  {
    id: 'c7',
    sender: 'Esther Howard',
    subject: 'SSO session drops after 15 minutes',
    time: '1d',
    dateTime: '2026-10-11T08:00:00Z',
    sla: 'overdue',
  },
  {
    id: 'c8',
    sender: 'Floyd Miles',
    subject: 'Refund request for the annual plan',
    time: '2d',
    dateTime: '2026-10-10T09:00:00Z',
  },
  {
    id: 'c9',
    sender: 'Kathryn Murphy with a very long display name that will not fit',
    subject: 'Thanks, that worked',
    time: '3d',
    dateTime: '2026-10-09T09:00:00Z',
  },
  {
    id: 'c10',
    sender: 'Savannah Nguyen',
    subject: 'Tracking number shows delivered but the parcel never arrived at our warehouse',
    time: '4d',
    dateTime: '2026-10-08T09:00:00Z',
    channel: 'chat',
  },
];

function Example({
  initial = 'c3',
  rows = ROWS,
  onValueChange,
  onEndReached,
}: {
  initial?: string | null;
  rows?: ConversationRowProps[];
  onValueChange?: (id: string) => void;
  onEndReached?: () => void;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <ConversationList
      aria-label="Mine"
      rows={rows}
      value={value}
      onValueChange={(id) => {
        setValue(id);
        onValueChange?.(id);
      }}
      onEndReached={onEndReached}
      // The list scrolls inside its own height (the list pane gives it the rest of the column).
      className="h-(--hds-layout-list) w-(--hds-layout-list) border border-w-14 border-neutral-subtle"
    />
  );
}

/** 2,000 rows, as a large inbox. */
const MANY: ConversationRowProps[] = Array.from({ length: 2000 }, (_, i) => ({
  ...ROWS[i % ROWS.length]!,
  id: `m${i}`,
  sender: `${ROWS[i % ROWS.length]!.sender.split(' ')[0]} ${i + 1}`,
}));

const meta = {
  title: 'Composites/ConversationList',
  component: ConversationList,
  args: { 'aria-label': 'Mine', rows: ROWS, value: 'c3', onValueChange: fn() },
  argTypes: { rows: { table: { disable: true } } },
  parameters: {
    design: { figmaNode: '5485:2399' },
    ai: {
      summary:
        'The conversation list: one-line rows (unread dot, sender, subject, SLA/AI/attachment icons, time) in a virtualized listbox with roving focus. Pass rows as data; onEndReached loads the next page.',
      useWhen:
        'Any queue of conversations in the list pane (My work, Unassigned, Mine, a team member, a tag, Closed). Render ConversationRowSkeleton ×12 while loading.',
      avoidWhen:
        'Showing one conversation in detail (use the conversation header and timeline) or a non-conversation list (use a plain list or table).',
    },
  },
} satisfies Meta<typeof ConversationList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Example onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const option = (name: RegExp) => canvas.getByRole('option', { name });

    // Tab lands on the selected row, not the first.
    await userEvent.tab();
    await expect(option(/^Albert Flores/)).toHaveFocus();

    // Arrows move focus only.
    await userEvent.keyboard('{ArrowDown}');
    await expect(option(/^Annette Black/)).toHaveFocus();
    await expect(option(/^Albert Flores/)).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    // Enter selects the focused row.
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('c4');
    await waitFor(() => expect(option(/^Annette Black/)).toHaveAttribute('aria-selected', 'true'));
    await expect(option(/^Albert Flores/)).toHaveAttribute('aria-selected', 'false');

    // Home / End jump to the ends; exactly one row is a tab stop.
    await userEvent.keyboard('{End}');
    await expect(option(/^Savannah Nguyen/)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(option(/^Darlene Robertson/)).toHaveFocus();
    await expect(canvas.getAllByRole('option').filter((o) => o.tabIndex === 0)).toHaveLength(1);

    // Space selects too, and the name says what the icons show.
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('c1');
    await expect(option(/^Darlene Robertson/)).toHaveAccessibleName(
      'Darlene Robertson 401 Unauthorized on /v2/auth/token in production unread, SLA due soon 1h',
    );
  },
};

export const NoSelection: Story = {
  render: () => <Example initial={null} />,
  play: async ({ canvas }) => {
    // With nothing selected, the first row is the tab stop.
    await userEvent.tab();
    await expect(canvas.getAllByRole('option')[0]).toHaveFocus();
  },
};

export const Loading: Story = {
  render: () => (
    <div
      aria-busy="true"
      aria-label="Loading conversations"
      role="status"
      className="w-(--hds-layout-list) border border-w-14 border-neutral-subtle"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <ConversationRowSkeleton key={i} />
      ))}
    </div>
  ),
};

/** Forced hover and focus (storybook-addon-pseudo-states): the class sits on the row itself. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover'], focusVisible: ['.state-focus'] },
  },
  render: () => (
    <ConversationList
      aria-label="States"
      value="s-selected"
      onValueChange={() => {}}
      rows={[
        { ...ROWS[2]!, id: 's-rest', sender: 'Rest' },
        { ...ROWS[2]!, id: 's-hover', sender: 'Hover', className: 'state-hover' },
        { ...ROWS[2]!, id: 's-focus', sender: 'Focus', className: 'state-focus' },
        { ...ROWS[0]!, id: 's-unread', sender: 'Unread' },
        { ...ROWS[2]!, id: 's-selected', sender: 'Selected' },
        { ...ROWS[2]!, id: 's-selected-hover', sender: 'Selected hover', className: 'state-hover' },
      ]}
      className="h-(--hds-layout-list) w-(--hds-layout-list) border border-w-14 border-neutral-subtle"
    />
  ),
};

/**
 * A large inbox: only the rows in view are rendered. End reaches the last row (scrolling it in),
 * and nearing the end asks for the next page.
 */
export const Large: Story = {
  args: { onEndReached: fn() },
  render: (args) => <Example initial={null} rows={MANY} onEndReached={args.onEndReached} />,
  play: async ({ canvas, args }) => {
    await waitFor(() => expect(canvas.getAllByRole('option').length).toBeGreaterThan(0));
    expect(canvas.getAllByRole('option').length).toBeLessThan(60);
    expect(args.onEndReached).not.toHaveBeenCalled();
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(canvas.getByRole('option', { name: /^Savannah 2000/ })).toHaveFocus(),
    );
    await expect(canvas.getByRole('option', { name: /^Savannah 2000/ })).toHaveAttribute(
      'aria-posinset',
      '2000',
    );
    await waitFor(() => expect(args.onEndReached).toHaveBeenCalled());

    // Scrolled back to the top, the focused row stays rendered, so Tab still reaches the list.
    const listbox = canvas.getByRole('listbox');
    listbox.scrollTop = 0;
    listbox.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(canvas.getByRole('option', { name: /^Darlene 1 / })).toBeVisible());
    await expect(canvas.getByRole('option', { name: /^Savannah 2000/ })).toHaveFocus();
    await expect(canvas.getAllByRole('option').filter((o) => o.tabIndex === 0)).toHaveLength(1);
  },
};
