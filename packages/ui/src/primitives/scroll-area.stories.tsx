import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { ScrollArea } from './scroll-area';

const ROWS = Array.from({ length: 40 }, (_, i) => `Conversation ${i + 1}`);

const meta = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
  parameters: {
    design: { figmaNode: 'none' },
    ai: {
      summary:
        'Scrollable region with thin token-coloured overlay scrollbars, native scrolling and a focusable viewport.',
      useWhen:
        'Any fixed-height region whose content can overflow: list panes, side panels, menus with many items.',
      avoidWhen:
        'Whole-page scrolling (let the document scroll) or long lists of many hundreds of rows (virtualise them).',
    },
  },
} satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea
      aria-label="Conversations"
      className="h-64 w-72 rounded-8 border border-neutral-soft"
    >
      <ul className="flex flex-col">
        {ROWS.map((r) => (
          <li
            key={r}
            className="border-b border-neutral-subtle px-3 py-2 text-14 leading-20 text-neutral-default"
          >
            {r}
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
  play: async ({ canvas }) => {
    const viewport = canvas.getByRole('region', { name: 'Conversations' });
    // Overflowing, so the viewport is a tab stop (arrow keys then scroll it natively; synthetic key
    // events can't drive native scrolling, so the test stops at focus).
    await waitFor(() => expect(viewport).toHaveAttribute('tabindex', '0'));
    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      orientation="horizontal"
      aria-label="Tags"
      className="w-72 rounded-8 border border-neutral-soft"
    >
      <div className="flex w-max gap-2 p-3">
        {ROWS.slice(0, 16).map((r) => (
          <span
            key={r}
            className="rounded-6 bg-neutral-default px-2 py-1 text-13 leading-19 text-neutral-default"
          >
            {r}
          </span>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Both: Story = {
  render: () => (
    <ScrollArea
      orientation="both"
      aria-label="Wide table"
      className="h-48 w-72 rounded-8 border border-neutral-soft"
    >
      <div className="grid w-max grid-cols-8 gap-2 p-3">
        {Array.from({ length: 96 }, (_, i) => (
          <span
            key={i}
            className="rounded-4 bg-neutral-soft px-3 py-2 text-13 leading-19 text-neutral-default"
          >
            Cell {i + 1}
          </span>
        ))}
      </div>
    </ScrollArea>
  ),
};
