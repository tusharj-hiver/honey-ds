/**
 * Rendering spike measurement (plan week 2, principle 6): scrolls the 60-message ThreadView story
 * top → bottom → top in headless Chromium and reports frame times, long tasks, mounted email
 * frames, and how far the reading position moves when an email above the viewport resizes.
 * Runs unthrottled and with 4x CPU throttling.
 *
 *   yarn build-storybook && yarn measure:thread [--json]
 *
 * Headless Chromium paints without a display, so frame times are a lower bound on a real screen;
 * compare runs with each other rather than with a device.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium, type Page } from 'playwright';

const STORY = 'composites-threadview--sixty';
const root = new URL('../storybook-static/', import.meta.url).pathname;
if (!existsSync(join(root, 'iframe.html'))) {
  console.error('storybook-static is missing: run `yarn build-storybook` first.');
  process.exit(1);
}

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname));
  const file = join(root, path.endsWith('/') ? `${path}index.html` : path);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
const port = (server.address() as { port: number }).port;

type ScrollStats = { frames: number[]; longTasks: number[]; maxFrames: number; messages: number };

/** Steady scroll, 30px per animation frame (~1800px/s at 60fps), down to the end and back up. */
function scrollRun(page: Page): Promise<ScrollStats> {
  return page.evaluate(
    () =>
      new Promise<ScrollStats>((resolve) => {
        const sc = document.querySelector<HTMLElement>('[data-slot=thread-view]')!;
        const longTasks: number[] = [];
        const po = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) longTasks.push(e.duration);
        });
        po.observe({ type: 'longtask' });
        const frames: number[] = [];
        let maxFrames = 0;
        let dir = 1;
        let last = 0;
        const tick = (now: number) => {
          if (last) frames.push(now - last);
          last = now;
          maxFrames = Math.max(
            maxFrames,
            document.querySelectorAll('iframe[data-slot=email-frame]').length,
          );
          if (dir === 1) {
            sc.scrollTop += 30;
            if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1) dir = -1;
          } else {
            sc.scrollTop -= 30;
            if (sc.scrollTop <= 0) {
              po.disconnect();
              const messages = Number(
                sc.querySelector('[aria-setsize]')?.getAttribute('aria-setsize') ?? 0,
              );
              resolve({ frames, longTasks, maxFrames, messages });
              return;
            }
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/**
 * Anchor stability: with the thread scrolled to the middle, grow (then shrink) an expanded email
 * that is rendered but above the viewport, and see how far the first visible message moves.
 */
function anchorRun(page: Page): Promise<{ grow: number; shrink: number; tested: boolean }> {
  return page.evaluate(async () => {
    const sc = document.querySelector<HTMLElement>('[data-slot=thread-view]')!;
    const settle = () => new Promise((r) => setTimeout(r, 400));
    sc.scrollTop = sc.scrollHeight / 2;
    await settle();
    const top = sc.getBoundingClientRect().top;
    const rows = () => [...sc.querySelectorAll<HTMLElement>('[data-index]')];
    const anchor = () => rows().find((r) => r.getBoundingClientRect().bottom > top + 1)!;
    const above = rows().find(
      (r) => r.getBoundingClientRect().bottom <= top && r.querySelector('iframe'),
    );
    if (!above) return { grow: 0, shrink: 0, tested: false };
    const doc = above.querySelector('iframe')!.contentDocument!;
    const measure = async (change: () => void) => {
      const a = anchor();
      const before = a.getBoundingClientRect().top;
      change();
      await settle();
      return Math.abs(a.getBoundingClientRect().top - before);
    };
    const filler = doc.createElement('div');
    filler.style.height = '300px';
    const grow = await measure(() => doc.body.appendChild(filler));
    const shrink = await measure(() => filler.remove());
    return { grow, shrink, tested: true };
  });
}

const pct = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]! : 0;
};
const r1 = (n: number) => Math.round(n * 10) / 10;

const browser = await chromium.launch();
const results = [];
for (const throttle of [1, 4]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${STORY}&viewMode=story`);
  await page.waitForSelector('iframe[data-slot=email-frame]');
  await page.waitForTimeout(1500);
  const s = await scrollRun(page);
  const anchor = await anchorRun(page);
  const f = s.frames.slice(5);
  results.push({
    cpuThrottle: `${throttle}x`,
    messages: s.messages,
    frames: f.length,
    frameMs: {
      p50: r1(pct(f, 50)),
      p95: r1(pct(f, 95)),
      p99: r1(pct(f, 99)),
      max: r1(Math.max(...f)),
    },
    // Frames are vsync-locked at ~16.67ms; a dropped frame is one that misses a vsync (> 20ms).
    droppedFrames: `${r1((100 * f.filter((x) => x > 20).length) / f.length)}%`,
    framesOver33ms: `${r1((100 * f.filter((x) => x > 33).length) / f.length)}%`,
    longTasks: { count: s.longTasks.length, maxMs: r1(Math.max(0, ...s.longTasks)) },
    maxMountedEmailFrames: s.maxFrames,
    anchorShiftPx: anchor.tested
      ? { grow: r1(anchor.grow), shrink: r1(anchor.shrink) }
      : 'not tested',
  });
  await page.close();
}
await browser.close();
server.close();

if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2));
else
  for (const r of results)
    console.log(
      `${r.cpuThrottle} CPU · ${r.messages} messages · ${r.frames} frames: p50 ${r.frameMs.p50}ms, p95 ${r.frameMs.p95}ms, p99 ${r.frameMs.p99}ms, max ${r.frameMs.max}ms; dropped (>20ms) ${r.droppedFrames}, >33ms ${r.framesOver33ms}; long tasks ${r.longTasks.count} (max ${r.longTasks.maxMs}ms); email frames mounted ≤ ${r.maxMountedEmailFrames}; anchor shift ${JSON.stringify(r.anchorShiftPx)}`,
    );
