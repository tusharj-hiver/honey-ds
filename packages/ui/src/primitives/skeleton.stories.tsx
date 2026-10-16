import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  args: { className: 'h-4 w-48' },
  parameters: {
    design: { figmaNode: 'none' },
    ai: {
      summary:
        'Honey DS shimmer placeholder: a pulsing neutral block sized with width/height utilities.',
      useWhen:
        'The loading state of a view whose layout is known: list rows, a conversation header, panel cards.',
      avoidWhen:
        'Actions in progress (use a button loading state) or unknown-length waits (use a spinner/progress).',
    },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('[data-slot=skeleton]');
    await expect(block).toHaveAttribute('aria-hidden', 'true');
  },
};

/** A conversation-row placeholder, the main use in the inbox list. */
export const ListRows: Story = {
  render: () => (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading conversations"
      className="flex w-96 flex-col gap-3"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  ),
};
