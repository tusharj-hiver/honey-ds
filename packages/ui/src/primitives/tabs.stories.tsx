import { Archive, Inbox01, Users01 } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsVariant } from './tabs';

const VARIANTS: TabsVariant[] = ['underline', 'pill'];

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  args: { defaultValue: 'mine' },
  parameters: {
    design: { figmaNode: '376:1733' },
    ai: {
      summary:
        'Honey DS tabs: underline (section tabs) or pill (compact switcher), optional icon and count; arrow keys switch tabs.',
      useWhen:
        'Switching between sibling views of the same content in place, e.g. Mine / Unassigned / Closed, or Email / Chat.',
      avoidWhen:
        'Navigating to another page (use a link or SideNav) or choosing a value in a form (use a radio group or select).',
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example({ variant, ...args }: { variant?: TabsVariant; defaultValue?: string }) {
  return (
    <Tabs {...args}>
      <TabsList variant={variant} aria-label="Conversation views">
        <TabsTrigger value="mine" icon={<Inbox01 />} count={12}>
          Mine
        </TabsTrigger>
        <TabsTrigger value="unassigned" icon={<Users01 />} count={3}>
          Unassigned
        </TabsTrigger>
        <TabsTrigger value="closed" icon={<Archive />}>
          Closed
        </TabsTrigger>
        <TabsTrigger value="spam" disabled>
          Spam
        </TabsTrigger>
      </TabsList>
      <TabsContent value="mine">Conversations assigned to you.</TabsContent>
      <TabsContent value="unassigned">Conversations nobody owns yet.</TabsContent>
      <TabsContent value="closed">Closed conversations.</TabsContent>
      <TabsContent value="spam">Spam.</TabsContent>
    </Tabs>
  );
}

export const Default: Story = {
  render: (args) => <Example defaultValue={args.defaultValue as string} />,
  play: async ({ canvas }) => {
    const mine = canvas.getByRole('tab', { name: /Mine/ });
    const unassigned = canvas.getByRole('tab', { name: /Unassigned/ });
    // Tab lands on the selected tab.
    await userEvent.tab();
    await expect(mine).toHaveFocus();
    await expect(mine).toHaveAttribute('aria-selected', 'true');
    // Arrow keys move focus and selection.
    await userEvent.keyboard('{ArrowRight}');
    await expect(unassigned).toHaveFocus();
    await expect(unassigned).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Conversations nobody owns yet.')).toBeVisible();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(mine).toHaveFocus();
    await expect(mine).toHaveAttribute('aria-selected', 'true');
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((v) => (
        <Example key={v} variant={v} defaultValue={args.defaultValue as string} />
      ))}
    </div>
  ),
};

export const LabelOnly: Story = {
  render: () => (
    <Tabs defaultValue="email">
      <TabsList variant="pill" aria-label="Channel">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

/** Forced hover and focus (storybook-addon-pseudo-states) on active and inactive tabs of both variants. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover'], focusVisible: ['.state-focus'] },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((v) => (
        <Tabs key={v} defaultValue="a">
          <TabsList variant={v} aria-label={`${v} states`}>
            <TabsTrigger value="a" className="state-hover">
              Active hover
            </TabsTrigger>
            <TabsTrigger value="b" className="state-hover">
              Hover
            </TabsTrigger>
            <TabsTrigger value="c" className="state-focus">
              Focus
            </TabsTrigger>
            <TabsTrigger value="d">Rest</TabsTrigger>
            <TabsTrigger value="e" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ))}
    </div>
  ),
};
