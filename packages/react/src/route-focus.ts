// Refs: CR-056 DEV-058 FR-CMP-009 FR-A11Y-002
//
// AppShell moves focus to <main> when `routeKey` changes. When the route changes from inside an
// open overlay (a menu item, a link in a popover or dialog), that overlay's Radix focus scope
// either holds focus (a menu's scope pulls the move back) or restores focus to its trigger a task
// after it closes. Either way the new screen starts with focus on a control from the old one.
// AppShell records each route change, and the package's overlay contents send focus to main
// instead of their trigger when they close before the person's next key or pointer press.
//
// Module-internal: not exported from the package entry point.
import { createContext, useContext } from "react";

export interface RouteFocus {
  /** The element a blocked route change still owes focus to, once; null when nothing is owed. */
  readonly take: () => HTMLElement | null;
}

export const RouteFocusContext = createContext<RouteFocus | null>(null);

/**
 * Wraps an overlay's `onCloseAutoFocus`. The consumer's handler runs first; if it prevents the
 * default, the consumer already chose where focus goes and nothing else happens.
 */
export function useRouteCloseAutoFocus(handler: ((event: Event) => void) | undefined): (event: Event) => void {
  const routeFocus = useContext(RouteFocusContext);
  return (event) => {
    handler?.(event);
    if (event.defaultPrevented) return;
    const target = routeFocus?.take() ?? null;
    if (target === null) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
  };
}
