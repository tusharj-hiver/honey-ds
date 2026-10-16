import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from './button';
import { TOAST_TONES, ToastCard, ToastProvider, Toaster, useToast } from './toast';

const meta = {
  title: 'Primitives/Toast',
  component: ToastCard,
  args: { title: 'Reply sent', onDismiss: fn() },
  parameters: {
    design: { figmaNode: '484:5412' },
    ai: {
      summary:
        'Honey DS toast: tinted surface per tone (error, warning, success, info, feature), sm (one line) or lg (title, description, action row), dismissible. Raise live toasts with useToast().show().',
      useWhen:
        'Brief confirmation or failure of an action the user just took ("Reply sent", "Couldn’t assign"), optionally with one action such as Undo.',
      avoidWhen:
        'Information the user must act on or keep reading (use a Banner or Dialog), or form validation (show it next to the field).',
    },
  },
} satisfies Meta<typeof ToastCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Static surface, no timers. */
export const Default: Story = {
  args: { tone: 'success' },
};

export const Small: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {TOAST_TONES.map((t) => (
        <ToastCard
          key={t}
          {...args}
          tone={t}
          size="sm"
          title={`${t} — Conversation assigned to Jacob`}
          action={{ label: 'Undo', onClick: () => {} }}
        />
      ))}
    </div>
  ),
};

export const Large: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {TOAST_TONES.map((t) => (
        <ToastCard
          key={t}
          {...args}
          tone={t}
          size="lg"
          title={`${t} — Reply sent`}
          description="Darlene Robertson will get your reply in a few seconds."
          action={{ label: 'Undo send', onClick: () => {} }}
        />
      ))}
    </div>
  ),
};

export const NotDismissible: Story = {
  args: { tone: 'info', dismissible: false, title: 'Syncing with Omni…' },
};

function LiveDemo() {
  const toast = useToast();
  return (
    <div className="flex gap-3">
      <Button
        onClick={() =>
          toast.show({
            tone: 'success',
            size: 'lg',
            title: 'Reply sent',
            description: 'Darlene Robertson will get your reply in a few seconds.',
            action: { label: 'Undo send', onClick: () => {} },
            timeout: 0,
          })
        }
      >
        Send reply
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.show({ tone: 'error', title: 'Couldn’t assign the conversation', timeout: 0 })
        }
      >
        Assign
      </Button>
    </div>
  );
}

/** Live toasts through ToastProvider + Toaster + useToast(). */
export const Live: Story = {
  render: () => (
    <ToastProvider>
      <LiveDemo />
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }));
    const title = await screen.findByText('Reply sent', { selector: '[data-slot=toast-title]' });
    // It fades in from opacity 0.
    await waitFor(() => expect(title).toBeVisible());
    await expect(screen.getByRole('button', { name: 'Undo send' })).toBeVisible();

    // Keyboard: F6 moves focus into the toasts (Base UI). Until then Base UI keeps the dismiss button
    // aria-hidden, so it is only announced once the toasts are focused or hovered.
    await userEvent.keyboard('{F6}');
    const dismiss = await screen.findByRole('button', { name: 'Dismiss notification' });
    // Viewport → toast → Undo send → Dismiss.
    for (let i = 0; i < 4 && document.activeElement !== dismiss; i++) await userEvent.tab();
    await expect(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.queryByText('Reply sent', { selector: '[data-slot=toast-title]' })).toBeNull(),
    );

    // Let the exit transition finish before the a11y check runs.
    await waitFor(() =>
      expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0),
    );
  },
};
