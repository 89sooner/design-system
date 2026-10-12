// Refs: CR-047 W-001
import type { PointerEvent } from "react";

/** The pointer position inside `box`, as the two custom properties `.docs-spotlight::after` reads. */
export function spotlightPosition(pointer: { readonly clientX: number; readonly clientY: number }, box: Pick<DOMRect, "left" | "top">): Readonly<Record<"--docs-spot-x" | "--docs-spot-y", string>> {
  return { "--docs-spot-x": `${Math.round(pointer.clientX - box.left)}px`, "--docs-spot-y": `${Math.round(pointer.clientY - box.top)}px` };
}

/**
 * `onPointerMove` handler for a `.docs-spotlight` surface. It writes style properties directly rather
 * than through React state, so tracking the pointer never re-renders the card. Touch and pen input
 * are ignored: the glow is a hover affordance and only shows for a fine pointer.
 */
export function trackSpotlight(event: PointerEvent<HTMLElement>): void {
  if (event.pointerType !== "mouse") return;
  const target = event.currentTarget;
  for (const [property, value] of Object.entries(spotlightPosition(event, target.getBoundingClientRect()))) target.style.setProperty(property, value);
}
