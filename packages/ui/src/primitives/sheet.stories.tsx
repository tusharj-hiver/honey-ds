import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from './button';
import { Input } from './input';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  parameters: {
    design: { figmaNode: '8748:1288' },
    ai: {
      summary:
        'Honey DS side drawer on Base UI Dialog: a right-anchored, inset panel (md 560 / lg 760) with a fixed header and close button, a scrolling body and an optional footer.',
      useWhen:
        'A longer task or detail view that keeps the page in context: editing a view, creating a rule, viewing a record.',
      avoidWhen:
        'Short confirmations (use Dialog), or panels that live in the layout permanently (use the app layout’s side panel).',
    },
    // Open sheets portal over the whole page: render each story in its own iframe on the docs page.
    docs: { story: { inline: false, iframeHeight: 520 } },
  },
} satisfies Meta<typeof Sheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Lets open/close animations settle so axe (which runs after play) measures final colours. */
const animationsSettled = () =>
  waitFor(() =>
    expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0),
  );

function EditViewSheet({
  size,
  defaultOpen = false,
  footer = true,
}: {
  size?: 'md' | 'lg';
  defaultOpen?: boolean;
  footer?: boolean;
}) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger render={<Button variant="secondary">Edit view</Button>} />
      <SheetContent size={size}>
        <SheetHeader title="Edit view" />
        <SheetBody>
          <SheetDescription>Changes apply to everyone who uses this view.</SheetDescription>
          <Input aria-label="View name" defaultValue="Billing escalations" />
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="text-14 leading-20 text-neutral-default">
              Condition {i + 1}: status is open and the tag is billing.
            </p>
          ))}
        </SheetBody>
        {footer ? (
          <SheetFooter>
            <span className="text-13 leading-19 text-neutral-soft">Last edited today</span>
            <div className="flex gap-3">
              <SheetClose render={<Button variant="secondary" size="sm" />}>Cancel</SheetClose>
              <SheetClose render={<Button size="sm" />}>Save</SheetClose>
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/** Opens from its trigger: focus moves inside, Escape closes and focus returns to the trigger. */
export const Default: Story = {
  render: () => <EditViewSheet />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Edit view' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const sheet = await screen.findByRole('dialog', { name: 'Edit view' });
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
    await animationsSettled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await animationsSettled();
  },
};

/** The header close button closes it too. */
export const CloseButton: Story = {
  render: () => <EditViewSheet />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit view' }));
    const sheet = await screen.findByRole('dialog', { name: 'Edit view' });
    await animationsSettled();
    await userEvent.click(
      sheet.querySelector<HTMLElement>('[data-slot=sheet-header] button[aria-label=Close]')!,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await animationsSettled();
  },
};

/** Figma Size=md (560). Open by default so Chromatic captures it. */
export const Medium: Story = {
  render: () => <EditViewSheet size="md" defaultOpen />,
  play: animationsSettled,
};

/** Figma Size=lg (760). */
export const Large: Story = {
  render: () => <EditViewSheet size="lg" defaultOpen />,
  play: animationsSettled,
};

/** No footer (Figma showActionBar=false). */
export const WithoutFooter: Story = {
  render: () => <EditViewSheet defaultOpen footer={false} />,
  play: animationsSettled,
};
