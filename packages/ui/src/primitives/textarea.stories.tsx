import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Textarea } from './textarea';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  args: { 'aria-label': 'Note', placeholder: 'Add a note for your team', onChange: fn() },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
  parameters: {
    design: { figmaNode: '5095:755' },
    ai: {
      summary: 'Honey DS multi-line text field, 3 sizes, same states as Input.',
      useWhen: 'Multi-line free text: notes, descriptions, message drafts.',
      avoidWhen: 'Single-line values (use Input) or rich text (use the editor).',
    },
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Note' });
    await userEvent.type(textarea, 'Line one{Enter}Line two');
    await expect(textarea).toHaveValue('Line one\nLine two');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Textarea {...args} aria-label="Empty" />
      <Textarea
        {...args}
        aria-label="Filled"
        defaultValue="Customer asked for a refund on order #4821."
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {SIZES.map((s) => (
        <Textarea key={s} {...args} size={s} aria-label={`Size ${s}`} placeholder={`Size ${s}`} />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Textarea {...args} aria-label="Default" placeholder="Default" />
      <Textarea {...args} aria-label="Filled" defaultValue="Filled value" />
      <Textarea {...args} aria-label="Error" defaultValue="Too short" aria-invalid />
      <Textarea {...args} aria-label="Disabled" placeholder="Disabled" disabled />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Error' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/** Forced hover and focus (storybook-addon-pseudo-states) so Chromatic captures the token changes. */
export const InteractionStates: Story = {
  parameters: {
    pseudo: {
      hover: ['.state-hover'],
      focus: ['.state-focus'],
      focusVisible: ['.state-focus'],
      focusWithin: ['.state-focus'],
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Textarea {...args} className="state-hover" aria-label="Hover" placeholder="Hover" />
      <Textarea {...args} className="state-focus" aria-label="Focus" placeholder="Focus" />
      <Textarea
        {...args}
        className="state-hover"
        aria-label="Error hover"
        defaultValue="Invalid"
        aria-invalid
      />
      <Textarea
        {...args}
        className="state-focus"
        aria-label="Error focus"
        defaultValue="Invalid"
        aria-invalid
      />
    </div>
  ),
};
