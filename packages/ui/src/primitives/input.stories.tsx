import { Mail01, InfoCircle } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Input } from './input';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: { 'aria-label': 'Email address', placeholder: 'name@company.com', onChange: fn() },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
  parameters: {
    design: { figmaNode: '185:378' },
    ai: {
      summary:
        'Honey DS single-line text field (3 sizes) with optional leading/trailing icons and a search variant.',
      useWhen:
        'Free-text entry of a single line: names, emails, filters. variant="search" for search boxes (adds icon + clear button).',
      avoidWhen:
        'Multi-line text (use Textarea) or picking from a fixed list (use a select/combobox).',
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Email address' });
    await userEvent.type(input, 'ana@hiver.com');
    await expect(input).toHaveValue('ana@hiver.com');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} aria-label="Plain" />
      <Input {...args} aria-label="With leading icon" leadingIcon={<Mail01 />} />
      <Input
        {...args}
        aria-label="With both icons"
        leadingIcon={<Mail01 />}
        trailingIcon={<InfoCircle />}
      />
      <Input {...args} variant="search" aria-label="Search" placeholder="Search" />
      <Input
        {...args}
        variant="search"
        aria-label="Search filled"
        placeholder="Search"
        defaultValue="refund policy"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {SIZES.map((s) => (
        <Input
          key={s}
          {...args}
          size={s}
          aria-label={`Size ${s}`}
          placeholder={`Size ${s}`}
          leadingIcon={<Mail01 />}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} aria-label="Default" placeholder="Default" />
      <Input {...args} aria-label="Filled" defaultValue="ana@hiver.com" />
      <Input {...args} aria-label="Error" defaultValue="ana@" aria-invalid />
      <Input {...args} aria-label="Disabled" placeholder="Disabled" disabled />
      <Input
        {...args}
        aria-label="Disabled search"
        variant="search"
        placeholder="Search"
        disabled
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('textbox', { name: 'Disabled' });
    await expect(disabled).toBeDisabled();
    await userEvent.type(disabled, 'x', { pointerEventsCheck: 0 });
    await expect(disabled).toHaveValue('');
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
      <Input {...args} className="state-hover" aria-label="Hover" placeholder="Hover" />
      <Input {...args} className="state-focus" aria-label="Focus" placeholder="Focus" />
      <Input
        {...args}
        className="state-hover"
        aria-label="Error hover"
        defaultValue="Invalid"
        aria-invalid
      />
      <Input
        {...args}
        className="state-focus"
        aria-label="Error focus"
        defaultValue="Invalid"
        aria-invalid
      />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="work-email" className="text-14 leading-20 font-medium text-neutral-default">
        Work email
      </label>
      <Input {...args} aria-label={undefined} id="work-email" size="md" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Work email' })).toBeInTheDocument();
  },
};

export const Search: Story = {
  args: {
    variant: 'search',
    'aria-label': 'Search conversations',
    placeholder: 'Search',
    onClear: fn(),
  },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('searchbox', { name: 'Search conversations' });
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();
    await userEvent.type(input, 'refund');
    await expect(input).toHaveValue('refund');
    const clear = canvas.getByRole('button', { name: 'Clear search' });
    await userEvent.tab();
    await expect(clear).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();
  },
};
