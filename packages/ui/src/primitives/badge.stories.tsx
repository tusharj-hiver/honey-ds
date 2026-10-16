import { CheckCircle } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { BADGE_TONES, BADGE_VARIANTS, Badge } from './badge';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Badge' },
  parameters: {
    design: { figmaNode: '279:4301' },
    ai: {
      summary:
        'Honey DS non-interactive status label: 4 fill styles, 15 tones, 4 sizes, pill or rounded.',
      useWhen: 'Showing a status, count or category next to content (e.g. "Open", "VIP", "3 new").',
      avoidWhen: 'Removable or user-created labels (use Tag) or anything clickable (use Button).',
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Badge')).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-4 gap-x-4 gap-y-2">
      {BADGE_VARIANTS.map((v) => (
        <span key={v} className="text-12 leading-18 font-medium text-neutral-soft">
          {v}
        </span>
      ))}
      {BADGE_TONES.map((t) =>
        BADGE_VARIANTS.map((v) => (
          <div key={`${t}-${v}`}>
            <Badge {...args} tone={t} variant={v} icon={<CheckCircle />}>
              {t}
            </Badge>
          </div>
        )),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['pill', 'rounded'] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-3">
          {SIZES.map((s) => (
            <Badge key={s} {...args} size={s} shape={shape} tone="info" icon={<CheckCircle />}>
              {`${shape} ${s}`}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} tone="success">
        Resolved
      </Badge>
      <Badge {...args} tone="warning" variant="outline">
        Pending
      </Badge>
      <Badge {...args} tone="error" variant="solid">
        Breached
      </Badge>
      <Badge {...args} tone="neutral" variant="ghost">
        Closed
      </Badge>
      <Badge {...args} tone="violet" icon={<CheckCircle />} aria-label="Verified" role="img">
        {null}
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Verified' })).toBeInTheDocument();
  },
};
