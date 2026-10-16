import { Inbox01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { EmptyState } from './empty-state';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Primitives/EmptyState',
  component: EmptyState,
  args: {
    title: 'No conversations found',
    description: 'Nothing matches “refund”. Try another search or clear the filters.',
    actionLabel: 'Clear filters',
    onAction: fn(),
  },
  parameters: {
    design: { figmaNode: '7435:1535' },
    ai: {
      summary:
        'Honey DS empty state: circular icon, title, optional description and one optional primary action; sm, md and lg.',
      useWhen:
        'A list, search or panel has nothing to show (empty inbox, no search results, no notes yet).',
      avoidWhen:
        'Errors (use a Banner or Toast) or loading (use Skeleton); never as a placeholder for content that is still arriving.',
    },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const action = canvas.getByRole('button', { name: 'Clear filters' });
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-10">
      {SIZES.map((s) => (
        <EmptyState key={s} {...args} size={s} />
      ))}
    </div>
  ),
};

export const TitleOnly: Story = {
  args: { description: undefined, actionLabel: undefined, onAction: undefined },
};

export const CustomIconAndHeading: Story = {
  args: {
    size: 'md',
    icon: <Inbox01 />,
    title: 'Inbox zero',
    description: 'Every conversation assigned to you is handled.',
    actionLabel: undefined,
    onAction: undefined,
    headingLevel: 2,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Inbox zero' })).toBeVisible();
  },
};
