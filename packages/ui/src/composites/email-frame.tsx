import DOMPurify, { type DOMPurify as Purifier } from 'dompurify';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '../lib/utils';

/**
 * Customer email HTML, isolated (plan principle 6, C4). The HTML is sanitized (second layer) and
 * rendered into a sandboxed srcdoc iframe:
 * - no `allow-scripts`, so nothing in the email runs; a CSP inside the document blocks every
 *   network fetch except images and fonts;
 * - `allow-same-origin`, so the parent can read the frame's height for auto-sizing;
 * - links open in a new tab (`<base target="_blank">` + `allow-popups-to-escape-sandbox`);
 * - the email's own CSS stays inside the frame, so it can't restyle the app.
 */

const CSP =
  "default-src 'none'; img-src https: data: cid:; style-src 'unsafe-inline'; font-src https: data:";

// Inside the frame: the email's own document, not the app. Emails assume a light page.
// hds-allow: email iframe reset stylesheet
const RESET = `html{color-scheme:light}body{margin:0;padding:0 2px;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1f1f1f;background:#fff;overflow-wrap:anywhere;word-break:break-word}img,video{max-width:100%;height:auto}table{max-width:100%}pre{white-space:pre-wrap}blockquote{margin:0 0 0 8px;padding-left:8px;border-left:2px solid #d4d4d4;color:#525252}a{color:#1d4ed8}`;

let purifier: Purifier | null = null;
function sanitize(html: string): string {
  if (!purifier) {
    purifier = DOMPurify(window);
    purifier.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'IMG') node.setAttribute('loading', 'lazy');
    });
  }
  return purifier.sanitize(html, {
    // Keep <style> from <head> and the start of <body>: Outlook, Gmail and most newsletters put
    // their CSS there, and DOMPurify drops it otherwise. It stays inside the sandboxed frame.
    FORCE_BODY: true,
    FORBID_TAGS: ['form', 'input', 'button', 'textarea', 'select', 'base', 'meta', 'link'],
    FORBID_ATTR: ['target'],
  });
}

export function emailDocument(html: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}"><base target="_blank"><style>${RESET}</style></head><body>${sanitize(html)}</body></html>`;
}

export interface EmailFrameProps {
  /** The email body HTML, as received. It is sanitized here. */
  html: string;
  /** Required: names the frame for screen readers, e.g. "Email from Darlene Robertson". */
  title: string;
  className?: string;
  /** Last known height (e.g. cached per message id), so a remount doesn't jump while it loads. */
  initialHeight?: number;
  /** Called whenever the email's rendered height changes. */
  onHeight?: (height: number) => void;
}

export function EmailFrame({ html, title, className, initialHeight, onHeight }: EmailFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => emailDocument(html), [html]);
  const onHeightRef = useRef(onHeight);
  useEffect(() => {
    onHeightRef.current = onHeight;
  });

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    // Set imperatively: no React render per resize.
    if (initialHeight) frame.style.height = `${initialHeight}px`;
    let observer: ResizeObserver | null = null;
    const attach = () => {
      const root = frame.contentDocument?.documentElement;
      if (!root) return;
      observer?.disconnect();
      observer = new ResizeObserver(() => {
        const h = Math.ceil(root.getBoundingClientRect().height);
        if (h > 0 && frame.style.height !== `${h}px`) {
          frame.style.height = `${h}px`;
          onHeightRef.current?.(h);
        }
      });
      observer.observe(root);
    };
    frame.addEventListener('load', attach);
    if (frame.contentDocument?.readyState === 'complete') attach();
    return () => {
      frame.removeEventListener('load', attach);
      observer?.disconnect();
    };
  }, [srcDoc, initialHeight]);

  return (
    <iframe
      ref={ref}
      data-slot="email-frame"
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      className={cn('block h-24 w-full border-0 bg-neutral-white', className)}
    />
  );
}
