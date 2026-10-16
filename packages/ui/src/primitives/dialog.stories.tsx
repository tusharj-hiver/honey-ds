import { InfoCircle } from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from './button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogStatus,
} from './dialog';

const meta = {
  title: 'Primitives/Dialog',
  component: Dialog,
  parameters: {
    design: { figmaNode: '7433:193' },
    ai: {
      summary:
        'Honey DS modal on Base UI Dialog: centred 440px surface with a body (optional error/warning/success/info icon chip, horizontal or vertical) and a footer of actions.',
      useWhen:
        'Confirming a destructive or irreversible action, or a short focused task that must be finished or cancelled before going back.',
      avoidWhen:
        'Long forms or side content next to the page (use Sheet), passive messages (use Toast), or anything the user should not be blocked by.',
    },
    // Open dialogs portal over the whole page: render each story in its own iframe on the docs page.
    docs: { story: { inline: false, iframeHeight: 360 } },
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Lets open/close animations settle so axe (which runs after play) measures final colours. */
const animationsSettled = () =>
  waitFor(() =>
    expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0),
  );

function ConfirmDialog({
  status,
  align,
  defaultOpen = false,
}: {
  status?: DialogStatus;
  align?: 'horizontal' | 'vertical';
  defaultOpen?: boolean;
}) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger render={<Button variant="secondary">Delete view</Button>} />
      <DialogContent>
        <DialogBody status={status} align={align}>
          <DialogHeader>
            <DialogTitle>Delete this view?</DialogTitle>
            <DialogDescription>
              Everyone who uses “Billing escalations” will lose it. Conversations are not deleted.
            </DialogDescription>
          </DialogHeader>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" size="sm" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="destructive" size="sm" />}>Delete view</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Opens from its trigger: focus moves inside, Escape closes and focus returns to the trigger. */
export const Default: Story = {
  render: () => <ConfirmDialog status="error" />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Delete view' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Delete this view?' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await animationsSettled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await animationsSettled();
  },
};

/** Figma Type=Error, horizontal. Open by default so Chromatic captures it. */
export const ErrorStatus: Story = {
  name: 'Error',
  render: () => <ConfirmDialog status="error" defaultOpen />,
  play: animationsSettled,
};

/** Figma Type=Warning (icon tinted foreground/warning/soft, as bound in Figma). */
export const WarningStatus: Story = {
  name: 'Warning',
  render: () => <ConfirmDialog status="warning" defaultOpen />,
  play: animationsSettled,
};

/** Figma Alignment=Vertical: chip above centred text. */
export const Vertical: Story = {
  render: () => <ConfirmDialog status="success" align="vertical" defaultOpen />,
  play: animationsSettled,
};

/** Footer types: Information (leading icon + text) with right-aligned actions. */
export const FooterWithLeading: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="secondary">Share view</Button>} />
      <DialogContent>
        <DialogBody status="info">
          <DialogHeader>
            <DialogTitle>Share this view with your team?</DialogTitle>
            <DialogDescription>Teammates can see it in their sidebar.</DialogDescription>
          </DialogHeader>
        </DialogBody>
        <DialogFooter
          leading={
            <>
              <InfoCircle aria-hidden className="size-4 shrink-0 text-fg-neutral-bold-soft" />
              <span>Read before proceeding.</span>
            </>
          }
        >
          <DialogClose render={<Button variant="secondary" size="sm" />}>Cancel</DialogClose>
          <DialogClose render={<Button size="sm" />}>Share</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: animationsSettled,
};

/** Footer type Stretch: both actions share the row. Body without a status chip (Custom). */
export const StretchFooter: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="secondary">Leave</Button>} />
      <DialogContent>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>Discard your reply?</DialogTitle>
            <DialogDescription>The draft will be deleted.</DialogDescription>
          </DialogHeader>
        </DialogBody>
        <DialogFooter stretch>
          <DialogClose render={<Button variant="secondary" size="sm" />}>Keep editing</DialogClose>
          <DialogClose render={<Button variant="destructive" size="sm" />}>Discard</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: animationsSettled,
};
