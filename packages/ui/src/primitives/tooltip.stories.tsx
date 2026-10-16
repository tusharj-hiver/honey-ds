import { Archive, InfoCircle } from '@honey-ds/icons';
import { cn } from '../lib/utils';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    design: { figmaNode: '6149:2320' },
    ai: {
      summary:
        'Honey DS tooltip: dark bubble with a label, an optional muted description (two-line treatment), four sides and an optional arrow.',
      useWhen:
        'Naming an icon-only control or adding a short hint to a control on hover and keyboard focus.',
      avoidWhen:
        'Essential information or anything interactive (use a popover or inline text); the trigger still needs its own accessible name.',
    },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="secondary"
              size="sm"
              aria-label="Archive conversation"
              leadingIcon={<Archive />}
            />
          }
        />
        <TooltipContent>Archive conversation</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Archive conversation' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.getByText('Archive conversation', { selector: '[data-slot=tooltip-label]' }),
      ).toBeVisible(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByText('Archive conversation', { selector: '[data-slot=tooltip-label]' }),
      ).toBeNull(),
    );
  },
};

export const WithDescription: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="tertiary" size="sm" leadingIcon={<InfoCircle />} />}>
        Auto-assign
      </TooltipTrigger>
      <TooltipContent description="New conversations go to the teammate with the fewest open chats.">
        Round robin
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Auto-assign' })).toHaveFocus();
    await waitFor(() => expect(screen.getByText(/fewest open chats/)).toBeVisible());
  },
};

/** Every Figma cell, held open: label-only and with-description × Arrow Top/Bottom/None/Left/Right. */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 px-8">
      {[false, true].flatMap((withDescription) =>
        (['top', 'bottom', 'none', 'left', 'right', null] as const).map((side, i) =>
          side === null ? (
            <div key={`${String(withDescription)}-${i}`} />
          ) : (
            <div
              key={`${String(withDescription)}-${side}`}
              // Two-line tooltips are taller: give their rows room so a bottom bubble clears the next row.
              className={cn(
                'flex w-96 items-center justify-center',
                withDescription ? 'h-48' : 'h-32',
              )}
            >
              <Tooltip open>
                <TooltipTrigger render={<Button variant="secondary" size="xs" />}>
                  {side}
                </TooltipTrigger>
                <TooltipContent
                  side={side === 'none' ? 'top' : side}
                  arrow={side !== 'none'}
                  description={
                    withDescription ? 'Visible to everyone who can open this inbox.' : undefined
                  }
                >
                  {withDescription ? 'Shared view' : 'Label'}
                </TooltipContent>
              </Tooltip>
            </div>
          ),
        ),
      )}
    </div>
  ),
};
