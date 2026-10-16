import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

// Mirrors the manual layout tokens (--hds-layout-list / -list-min / -list-max, --hds-layout-side…).
// react-resizable-panels needs literal sizes; numbers are pixels in v4.
const LIST = { defaultSize: 320, minSize: 280, maxSize: 560 } as const;
const SIDE = { defaultSize: 400, minSize: 280, maxSize: 640 } as const;

function Pane({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-neutral-white p-4 text-14 leading-20 text-neutral-soft">
      {label}
    </div>
  );
}

const meta = {
  title: 'Primitives/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'fullscreen',
    design: { figmaNode: 'none' },
    ai: {
      summary:
        'Resizable panes (react-resizable-panels): a group of panels with keyboard-operable separators.',
      useWhen:
        'The app layout: list, conversation and side panel widths the user can adjust and keep.',
      avoidWhen:
        'Small layouts inside a component (use flex or grid); anything that should not be user-sized.',
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The app's three panes: list 320 [280–560], conversation flexible, side panel 400 [280–640]. */
export const AppLayout: Story = {
  render: () => (
    <div className="h-96 w-full border border-neutral-soft">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="list" {...LIST}>
          <Pane label="Conversation list" />
        </ResizablePanel>
        <ResizableHandle aria-label="Resize conversation list" />
        <ResizablePanel id="conversation">
          <Pane label="Conversation" />
        </ResizablePanel>
        <ResizableHandle aria-label="Resize side panel" />
        <ResizablePanel id="side" {...SIDE}>
          <Pane label="Side panel" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    const handle = canvas.getByRole('separator', { name: 'Resize conversation list' });
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow'));
    const before = Number(handle.getAttribute('aria-valuenow'));
    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before),
    );
  },
};

/** Floating panels on the page background: the handle is the 8px gutter between them. */
export const GapHandles: Story = {
  render: () => (
    <div className="h-96 w-full bg-neutral-soft p-2">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="30" minSize="20">
          <div className="h-full rounded-16 bg-neutral-white p-4 shadow-sm">List</div>
        </ResizablePanel>
        <ResizableHandle variant="gap" aria-label="Resize list" />
        <ResizablePanel defaultSize="70">
          <div className="h-full rounded-16 bg-neutral-white p-4 shadow-sm">Conversation</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    const handle = canvas.getByRole('separator', { name: 'Resize list' });
    const before = Number(handle.getAttribute('aria-valuenow'));
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before),
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="h-96 w-full border border-neutral-soft">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize="60">
          <Pane label="Thread" />
        </ResizablePanel>
        <ResizableHandle aria-label="Resize composer" />
        <ResizablePanel defaultSize="40" minSize="20">
          <Pane label="Composer" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};
