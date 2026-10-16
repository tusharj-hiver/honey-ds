import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../primitives/tooltip';
import css from '../styles.css?inline';
import { ShadowRoot, shadowCompatCss } from './shadow';

const meta = {
  title: 'Foundations/Shadow root',
  component: ShadowRoot,
  // The compiled stylesheet is passed as an arg; keep it out of the Controls and Docs tables.
  argTypes: { css: { table: { disable: true } } },
  parameters: {
    design: { figmaNode: 'none' },
    ai: {
      summary:
        'Renders library components inside a shadow root (for embedding in a host page), with popups portalled into the same root and light/dark following the page.',
      useWhen: 'Mounting UI inside another app’s page where its CSS must not leak in or out.',
      avoidWhen: 'Normal screens in apps/web: they render in the document.',
    },
  },
} satisfies Meta<typeof ShadowRoot>;
export default meta;
type Story = StoryObj<typeof meta>;

const shadowOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-slot=shadow-host]')!.shadowRoot!;

export const Components: Story = {
  args: { css, children: null },
  render: (args) => (
    <ShadowRoot css={args.css}>
      <div className="flex flex-col gap-3">
        <Input aria-label="Search" placeholder="Search conversations" />
        <div className="flex items-center gap-2">
          <Button>Reply</Button>
          <Badge>Open</Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button variant="secondary">Hint</Button>} />
              <TooltipContent side="right">Shown inside the shadow root</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div data-testid="dashed" className="border border-dashed border-neutral-default p-2">
          border-dashed must beat the compat defaults
        </div>
      </div>
    </ShadowRoot>
  ),
  play: async ({ canvasElement }) => {
    const shadow = shadowOf(canvasElement);
    await waitFor(() => expect(shadow.querySelector('input')).not.toBeNull());

    // Styles reach the shadow tree.
    const field = shadow.querySelector('input')!.parentElement!;
    await expect(getComputedStyle(field).borderTopStyle).toBe('solid');
    const dashed = shadow.querySelector<HTMLElement>('[data-testid=dashed]')!;
    await expect(getComputedStyle(dashed).borderTopStyle).toBe('dashed');
    const reply = [...shadow.querySelectorAll('button')].find((b) => b.textContent === 'Reply')!;
    await expect(getComputedStyle(reply).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

    // The tooltip portals into the shadow root, not document.body.
    const hint = [...shadow.querySelectorAll('button')].find((b) => b.textContent === 'Hint')!;
    await userEvent.hover(hint);
    await waitFor(() =>
      expect(shadow.querySelector('[data-slot=tooltip-label]')?.textContent).toBe(
        'Shown inside the shadow root',
      ),
    );
    await expect(document.body.querySelector('[data-slot=tooltip-label]')).toBeNull();

    // The host follows the page's light/dark switch.
    const host = canvasElement.querySelector<HTMLElement>('[data-slot=shadow-host]')!;
    const before = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = 'dark';
    await waitFor(() => expect(host.dataset.theme).toBe('dark'));
    if (before) document.documentElement.dataset.theme = before;
    else delete document.documentElement.dataset.theme;
    await waitFor(() => expect(host.dataset.theme).toBe(before));

    // The a11y check runs after play: let the tooltip fade-in and the theme colour transitions
    // finish, or axe measures half-blended colours.
    await waitFor(() =>
      expect(
        [...document.getAnimations(), ...shadow.getAnimations()].filter(
          (a) => a.playState === 'running',
        ),
      ).toHaveLength(0),
    );
  },
};

/**
 * Storybook's own page loads styles.css, and `@property` registrations are page-wide, so the story
 * above passes with or without the compat block. A host page that never loaded our CSS is the real
 * case: this checks it in a blank iframe, once without the block (Tailwind borders break) and once
 * with it.
 */
export const HostWithoutOurCss: Story = {
  args: { css, children: null },
  render: () => <p>Checks the compat CSS in a blank iframe (see the play function).</p>,
  play: async ({ canvasElement }) => {
    const frame = document.createElement('iframe');
    frame.title = 'blank host page';
    canvasElement.append(frame);
    const doc = frame.contentDocument!;
    const probe = (withCompat: boolean) => {
      const host = doc.createElement('div');
      doc.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        `<style>${css}${withCompat ? shadowCompatCss(css) : ''}</style>` +
        '<div class="border">solid</div><div class="border border-dashed">dashed</div>';
      const [solid, dashed] = [...shadow.querySelectorAll('div')];
      return [
        frame.contentWindow!.getComputedStyle(solid!).borderTopStyle,
        frame.contentWindow!.getComputedStyle(dashed!).borderTopStyle,
      ];
    };
    await expect(probe(false)).toEqual(['none', 'dashed']);
    await expect(probe(true)).toEqual(['solid', 'dashed']);
  },
};
