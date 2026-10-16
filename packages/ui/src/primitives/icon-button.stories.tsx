import { DotsHorizontal, Plus, Trash01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { IconButton } from './button';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'destructive', 'filled'] as const;
const SIZES = ['2xs', 'xs', 'sm', 'md', 'lg'] as const;
const FORCED_STATES = ['rest', 'hover', 'focus', 'active', 'disabled'] as const;

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  args: { icon: <DotsHorizontal />, 'aria-label': 'More actions', onClick: fn() },
  parameters: {
    design: { figmaNode: '65:178' },
    ai: {
      summary: 'Square, icon-only Button with a required aria-label. Same variants and sizes.',
      useWhen:
        'Toolbar and row actions where an icon is self-explanatory (more, close, delete, add). Pair with a Tooltip that repeats the label.',
      avoidWhen:
        'The action needs words to be understood, or is the main action of a view (use Button).',
    },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'More actions' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {VARIANTS.map((v) => (
        <IconButton key={v} {...args} variant={v} icon={<Plus />} aria-label={`Add (${v})`} />
      ))}
      <IconButton {...args} variant="destructive" icon={<Trash01 />} aria-label="Delete" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {SIZES.map((s) => (
        <IconButton key={s} {...args} size={s} aria-label={`More actions (${s})`} />
      ))}
    </div>
  ),
};

/** Forced hover/focus/active (storybook-addon-pseudo-states) so Chromatic captures each state. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover'], focusVisible: ['.state-focus'], active: ['.state-active'] },
  },
  render: (args) => (
    <div className="grid grid-cols-5 items-center gap-3">
      {FORCED_STATES.map((s) => (
        <span key={s} className="text-12 leading-18 text-neutral-soft">
          {s}
        </span>
      ))}
      {VARIANTS.map((v) =>
        FORCED_STATES.map((s) => (
          <IconButton
            key={`${v}-${s}`}
            {...args}
            className={`state-${s} justify-self-start`}
            variant={v}
            disabled={s === 'disabled'}
            aria-label={`More actions (${v}, ${s})`}
          />
        )),
      )}
    </div>
  ),
};
