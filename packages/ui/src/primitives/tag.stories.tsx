import { Tag01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { Tag } from './tag';

const TONES = ['neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['sm', 'md'] as const;

const meta = {
  title: 'Primitives/Tag',
  component: Tag,
  args: { children: 'Billing', onRemove: fn() },
  parameters: {
    design: { figmaNode: '374:1775' },
    ai: {
      summary: 'Honey DS compact chip, 5 tones × 2 sizes, optional border, icon and remove button.',
      useWhen:
        'User-applied labels on a conversation or contact, filter chips, selected values in a multi-select.',
      avoidWhen: 'System statuses that users cannot remove (use Badge).',
    },
  },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { removable: true },
  play: async ({ canvas, args }) => {
    const remove = canvas.getByRole('button', { name: 'Remove Billing' });
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {[true, false].map((bordered) =>
        [true, false].map((removable) => (
          <div key={`${bordered}-${removable}`} className="flex flex-wrap items-center gap-2">
            {TONES.map((t) => (
              <Tag
                key={t}
                {...args}
                tone={t}
                bordered={bordered}
                removable={removable}
                removeLabel={`Remove ${t} ${bordered ? 'bordered' : 'plain'}`}
              >
                {t}
              </Tag>
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {SIZES.map((s) => (
        <Tag key={s} {...args} size={s} icon={<Tag01 />} removable removeLabel={`Remove size ${s}`}>
          {s}
        </Tag>
      ))}
      <Tag {...args} removable>
        A very long label that truncates
      </Tag>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args}>Static</Tag>
      <Tag {...args} tone="error" removable>
        Escalated
      </Tag>
      <Tag {...args} tone="info" icon={<Tag01 />}>
        With icon
      </Tag>
    </div>
  ),
};

function RemovableList({ initial }: { initial: string[] }) {
  const [tags, setTags] = useState(initial);
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Applied tags" role="group">
      {tags.map((t) => (
        <Tag
          key={t}
          tone="info"
          size="md"
          removable
          onRemove={() => setTags((cur) => cur.filter((x) => x !== t))}
        >
          {t}
        </Tag>
      ))}
    </div>
  );
}

export const RemoveWithKeyboard: Story = {
  render: () => <RemovableList initial={['Billing', 'Refund', 'VIP']} />,
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.tab();
    const removeRefund = canvas.getByRole('button', { name: 'Remove Refund' });
    await expect(removeRefund).toHaveFocus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(canvas.queryByText('Refund')).toBeNull());
    await expect(canvas.getByText('Billing')).toBeInTheDocument();
    await expect(canvas.getByText('VIP')).toBeInTheDocument();
  },
};
