import { ArrowRight, Plus, Trash01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from './button';

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'destructive',
  'filled',
  'link',
  'linkSecondary',
  'linkDanger',
] as const;
const SIZES = ['2xs', 'xs', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Send reply', onClick: fn() },
  parameters: {
    design: { figmaNode: '65:178' },
    ai: {
      summary: 'Honey DS button with 9 variants and 5 sizes.',
      useWhen:
        'Any clickable action. Primary for the main action of a view; secondary/filled for the rest; tertiary for low emphasis.',
      avoidWhen: 'Navigation between pages (use a link) or icon-only actions (use IconButton).',
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Send reply' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
      <span className="rounded-6 bg-static-black p-2">
        <Button {...args} variant="linkReverse">
          linkReverse
        </Button>
      </span>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {SIZES.map((s) => (
        <Button key={s} {...args} size={s} leadingIcon={<Plus />}>
          {s}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: { leadingIcon: <Plus />, trailingIcon: <ArrowRight /> },
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((v) => (
        <Button key={v} {...args} variant={v} disabled>
          {v}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvas, args }) => {
    const [first] = canvas.getAllByRole('button');
    await userEvent.click(first!, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const DestructiveWithIcon: Story = {
  args: { variant: 'destructive', leadingIcon: <Trash01 />, children: 'Delete draft' },
};

const FORCED_STATES = ['rest', 'hover', 'focus', 'active', 'disabled'] as const;

/** Every variant in every state, forced with storybook-addon-pseudo-states so Chromatic captures them. */
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
          // The addon forces the state on the element its selector matches, so the class goes on
          // the button itself, not a wrapper.
          <Button
            key={`${v}-${s}`}
            {...args}
            className={`state-${s} justify-self-start`}
            variant={v}
            disabled={s === 'disabled'}
          >
            {v}
          </Button>
        )),
      )}
    </div>
  ),
};
