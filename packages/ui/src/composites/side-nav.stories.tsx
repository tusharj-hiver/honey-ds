import {
  BarChart01,
  Tag01,
  Briefcase01,
  CheckCircle,
  Keyboard01,
  Moon01,
  Settings01,
  User01,
  UserX01,
  Users01,
} from '@honey-ds/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import {
  SideNav,
  SideNavContent,
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavSection,
  SideNavSubmenu,
} from './side-nav';

const meta = {
  title: 'Composites/SideNav',
  component: SideNav,
  args: { 'aria-label': 'Inboxes' },
  parameters: {
    layout: 'fullscreen',
    design: { figmaNode: '7767:777' },
    ai: {
      summary:
        'The app’s collapsible left navigation: header with collapse toggle, My work, one section per inbox with view links and counts, and a footer.',
      useWhen: 'Once, in the app layout. Views are links (pass a router Link via `render`).',
      avoidWhen: 'In-page tabs or filters (use Tabs), or menus of actions (use DropdownMenu).',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-160">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNav>;
export default meta;
type Story = StoryObj<typeof meta>;

// Links in stories go nowhere; preventDefault keeps Storybook on the page.
const href = '#';
const stay = (e: { preventDefault: () => void }) => e.preventDefault();

function Items({ itemClassName }: { itemClassName?: string }) {
  return (
    <>
      <SideNavHeader title="Omni" />
      <SideNavContent>
        <SideNavItem icon={<Briefcase01 />} count={18} href={href} onClick={stay} active>
          My work
        </SideNavItem>
        <SideNavSection title="Support">
          <SideNavItem
            icon={<UserX01 />}
            count={7}
            href={href}
            onClick={stay}
            className={itemClassName}
          >
            Unassigned
          </SideNavItem>
          <SideNavItem icon={<User01 />} count={12} href={href} onClick={stay}>
            Mine
          </SideNavItem>
          <SideNavItem icon={<Users01 />} href={href} onClick={stay}>
            By team
          </SideNavItem>
          <SideNavSubmenu icon={<Tag01 />} label="By tags">
            <SideNavItem icon={<Tag01 />} href={href} onClick={stay}>
              Billing
            </SideNavItem>
            <SideNavItem icon={<Tag01 />} href={href} onClick={stay}>
              Refunds
            </SideNavItem>
          </SideNavSubmenu>
          <SideNavItem icon={<CheckCircle />} count="99+" href={href} onClick={stay}>
            Closed
          </SideNavItem>
        </SideNavSection>
        <SideNavSection title="Billing" defaultOpen={false}>
          <SideNavItem icon={<UserX01 />} count={2} href={href} onClick={stay}>
            Unassigned
          </SideNavItem>
        </SideNavSection>
      </SideNavContent>
      <SideNavFooter>
        <SideNavItem icon={<BarChart01 />} href={href} onClick={stay}>
          Analytics
        </SideNavItem>
        <SideNavItem icon={<Settings01 />} href={href} onClick={stay}>
          Settings
        </SideNavItem>
        <SideNavItem icon={<Moon01 />} href={href} onClick={stay}>
          Dark theme
        </SideNavItem>
        <SideNavItem icon={<Keyboard01 />} href={href} onClick={stay}>
          Shortcuts
        </SideNavItem>
      </SideNavFooter>
    </>
  );
}

const waitForAnimations = () =>
  waitFor(() =>
    expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0),
  );

export const Default: Story = {
  render: (args) => (
    <SideNav {...args}>
      <Items />
    </SideNav>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Inboxes' });
    await expect(canvas.getByRole('link', { name: /My work/ })).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Tab order is the reading order: toggle, My work, the Support header, its views.
    await userEvent.tab();
    const toggle = canvas.getByRole('button', { name: 'Collapse navigation' });
    await expect(toggle).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: /My work/ })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Support' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: /Unassigned/ })).toHaveFocus();

    // A folded section hides its views; its header expands it.
    const billing = canvas.getByRole('button', { name: 'Billing' });
    await expect(billing).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(billing);
    await expect(billing).toHaveAttribute('aria-expanded', 'true');

    // The toggle collapses the nav and keeps focus; labels become accessible names.
    await userEvent.click(toggle);
    const expand = canvas.getByRole('button', { name: 'Expand navigation' });
    await expect(expand).toHaveFocus();
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toHaveAttribute('data-collapsed');
    await expect(canvas.getByRole('link', { name: 'My work, 18' })).toBeVisible();
    await userEvent.click(expand);
    await expect(canvas.getByRole('button', { name: 'Collapse navigation' })).toHaveFocus();
    await waitForAnimations();
  },
};

/**
 * The pinned-collapsed rail without peeking: top-level items are icons with tooltips, and each inbox
 * is one avatar (its initials), so inboxes can be told apart. Clicking an avatar opens the nav for now.
 */
export const Collapsed: Story = {
  args: { collapsed: true, peek: false, onCollapsedChange: fn() },
  render: (args) => (
    <SideNav {...args}>
      <Items />
    </SideNav>
  ),
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole('link', { name: 'My work, 18' })).toBeVisible();
    // Inbox views are behind their inbox's avatar on the rail.
    await expect(canvas.queryByRole('link', { name: /Unassigned/ })).toBeNull();
    const support = canvas.getByRole('button', { name: 'Support' });
    await userEvent.hover(support);
    await waitFor(() =>
      expect(document.querySelector('[data-slot=tooltip-label]')?.textContent).toBe('Support'),
    );
    // Clicking the avatar opens the nav for now, showing that inbox's views, and never pins it.
    await userEvent.click(support);
    const nav = canvasElement.querySelector('[data-slot=side-nav]')!;
    await waitFor(() => expect(nav).toHaveAttribute('data-peeking'));
    await expect(canvas.getByRole('link', { name: /Unassigned/ })).toBeVisible();
    await expect(args.onCollapsedChange).not.toHaveBeenCalled();
    await userEvent.unhover(nav);
    await waitFor(() => expect(nav).not.toHaveAttribute('data-peeking'));
    await waitForAnimations();
  },
};

/** The default rail: hovering widens it over the content, leaving the layout space at 50px. */
export const RailPeek: Story = {
  args: { collapsed: true },
  render: (args) => (
    <SideNav {...args}>
      <Items />
    </SideNav>
  ),
  play: async ({ canvasElement, canvas }) => {
    const nav = canvasElement.querySelector<HTMLElement>('[data-slot=side-nav]')!;
    const rail = canvasElement.querySelector<HTMLElement>('[data-slot=side-nav-rail]')!;
    const railWidth = rail.getBoundingClientRect().width;
    await userEvent.hover(nav);
    await waitFor(() => expect(nav).toHaveAttribute('data-peeking'));
    await waitForAnimations();
    // While peeking, the header button says what it does: keep the nav open.
    await expect(canvas.getByRole('button', { name: 'Keep navigation open' })).toBeVisible();
    // Labels show while peeking, and the rail keeps its 50px in the layout.
    await expect(canvas.getByRole('link', { name: /Unassigned/ })).toHaveTextContent('Unassigned');
    await expect(rail.getBoundingClientRect().width).toBe(railWidth);
    await expect(nav.getBoundingClientRect().width).toBeGreaterThan(railWidth);
    // "By tags" opens its nested tags.
    await userEvent.click(canvas.getByRole('button', { name: 'By tags' }));
    await expect(canvas.getByRole('link', { name: 'Billing' })).toBeVisible();
    await userEvent.unhover(nav);
    await waitFor(() => expect(nav).not.toHaveAttribute('data-peeking'));
    await waitForAnimations();
  },
};

/** Forced hover and focus (storybook-addon-pseudo-states), so Chromatic captures them. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover'], focusVisible: ['.state-focus'] },
  },
  render: (args) => (
    <div className="flex gap-4">
      <SideNav {...args} aria-label="Hover state">
        <Items itemClassName="state-hover" />
      </SideNav>
      <SideNav {...args} aria-label="Focus state">
        <Items itemClassName="state-focus" />
      </SideNav>
    </div>
  ),
};
