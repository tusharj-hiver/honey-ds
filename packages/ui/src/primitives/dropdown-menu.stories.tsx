import {
  Archive,
  ChevronDown,
  Copy01,
  Edit01,
  Inbox01,
  Trash01,
  UserPlus01,
} from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

type StoryArgs = ComponentProps<typeof DropdownMenu> & { onItemClick: () => void };

const meta: Meta<StoryArgs> = {
  title: 'Primitives/DropdownMenu',
  args: { onItemClick: fn() },
  parameters: {
    design: { figmaNode: '6003:8485' },
    ai: {
      summary:
        'Honey DS dropdown menu on Base UI Menu: items with icon/shortcut, checkbox and radio items, groups, separators, submenus and an optional title header.',
      useWhen:
        'A list of actions or options revealed from a button (row actions, overflow menus, view settings).',
      avoidWhen: 'Choosing a form value (use a select/combobox) or primary navigation.',
    },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  render: ({ onItemClick, ...args }) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger
        render={<Button variant="secondary" size="sm" trailingIcon={<ChevronDown />} />}
      >
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          icon={<Edit01 />}
          trailing={<DropdownMenuShortcut>E</DropdownMenuShortcut>}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Archive />}
          onClick={onItemClick}
          trailing={<DropdownMenuShortcut>A</DropdownMenuShortcut>}
        >
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Copy01 />}>Copy link</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash01 />} variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    // Enter opens and highlights the first item; ArrowDown moves the highlight.
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: /Edit/ })).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: /Archive/ })).toHaveAttribute('data-highlighted'),
    );
    await waitFor(() => expect(menu).toBeVisible()); // after the fade-in, not mid-animation

    // Escape closes and returns focus to the trigger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    // Selecting an item fires its onClick and closes the menu.
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('menuitem', { name: /Archive/ }));
    await expect(args.onItemClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  },
};

function StatesMenu() {
  const [showArchived, setShowArchived] = useState(true);
  const [showSpam, setShowSpam] = useState(false);
  const [sort, setSort] = useState('newest');
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger
        render={<Button variant="secondary" size="sm" trailingIcon={<ChevronDown />} />}
      >
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent title="Inbox view">
        <DropdownMenuItem icon={<Inbox01 />}>Default</DropdownMenuItem>
        <DropdownMenuItem icon={<Inbox01 />} selected>
          Selected
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Inbox01 />} disabled>
          Disabled
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Inbox01 />}
          trailing={<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>}
        >
          With shortcut
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
            Archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showSpam} onCheckedChange={setShowSpam}>
            Spam
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<UserPlus01 />}>Assign to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Priya</DropdownMenuItem>
            <DropdownMenuItem>Marcus</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Held open: title header and every row state (default, selected, disabled, checked, radio, submenu). */
export const AllStates: Story = {
  render: () => (
    <div className="min-h-160 min-w-120">
      <StatesMenu />
    </div>
  ),
  play: async () => {
    await screen.findByRole('menu');
    await expect(screen.getByRole('menuitemcheckbox', { name: 'Archived' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(screen.getByRole('menuitemradio', { name: 'Newest first' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(screen.getByRole('menuitem', { name: 'Disabled' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

/** ArrowRight on a submenu trigger opens the submenu and moves focus into it. */
export const Submenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="secondary" size="sm" trailingIcon={<ChevronDown />} />}
      >
        More
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<Copy01 />}>Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<UserPlus01 />}>Assign to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Priya</DropdownMenuItem>
            <DropdownMenuItem>Marcus</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await screen.findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Priya' })).toHaveAttribute('data-highlighted'),
    );
  },
};
