import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortalContainerProvider } from './portal';

const PROPERTY_RULE = /@property\s+(--[\w-]+)\s*\{([^}]*)\}/g;
const INITIAL_VALUE = /initial-value\s*:\s*([^;]+)/;

/**
 * Tailwind v4 gives its internal variables (`--tw-border-style`, `--tw-shadow`, …) their defaults
 * with `@property`, which is ignored inside shadow roots. Without those defaults a plain `border`
 * resolves to `border-style: none` and rings vanish. This turns every `@property` in the compiled
 * CSS into an ordinary declaration in the `properties` layer, the lowest one, so utilities still win.
 */
export function shadowCompatCss(compiledCss: string): string {
  const declarations = [...compiledCss.matchAll(PROPERTY_RULE)].map(([, name, body]) => {
    const initial = INITIAL_VALUE.exec(body ?? '')?.[1]?.trim();
    return `  ${name}: ${initial ?? 'initial'};`;
  });
  if (!declarations.length) return '';
  return `@layer properties {\n:host, *, ::before, ::after, ::backdrop {\n${declarations.join('\n')}\n}\n}\n`;
}

/**
 * Renders children inside an open shadow root styled with `css` (the compiled
 * `@honey-ds/ui/styles.css`, e.g. imported with `?inline`). Popups portal into the same root, and
 * the host mirrors the page's `data-theme`, so light and dark keep working. `@font-face` does not
 * apply inside shadow roots, so the page must load the fonts itself (any page that imports
 * `@honey-ds/ui/styles.css` does).
 */
export function ShadowRoot({ css, children }: { css: string; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    setRoot(shadow);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const sync = () => {
      const theme = document.documentElement.dataset.theme;
      if (theme) host.dataset.theme = theme;
      else delete host.dataset.theme;
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} data-slot="shadow-host">
      {root &&
        createPortal(
          <>
            <style>{css + shadowCompatCss(css)}</style>
            <PortalContainerProvider container={root}>
              <div className="font-sans text-neutral-default">{children}</div>
            </PortalContainerProvider>
          </>,
          root,
        )}
    </div>
  );
}
