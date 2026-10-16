import { createContext, type ReactNode, type RefObject, useContext } from 'react';

/**
 * Where floating UI (tooltips, menus, popovers) portals to. Defaults to document.body.
 * Pass a ShadowRoot (or an element inside one) so popups inherit the shadow root's styles.
 */
export type PortalContainer =
  HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null;

const PortalContainerContext = createContext<PortalContainer | undefined>(undefined);

/** Sets the default portal container for every popup rendered below it. */
export function PortalContainerProvider({
  container,
  children,
}: {
  container: PortalContainer;
  children: ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
  );
}

/** An explicit `container` prop wins over the provider; `undefined` falls back to document.body. */
export function usePortalContainer(container?: PortalContainer): PortalContainer | undefined {
  const fromContext = useContext(PortalContainerContext);
  return container !== undefined ? container : fromContext;
}
