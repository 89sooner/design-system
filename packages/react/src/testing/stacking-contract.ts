// Refs: CR-058 FR-CMP-006 FR-TOK-008
//
// An open overlay surface must be the topmost element at its own centre. A surface drawn under
// its scrim (`cdt-overlay`) is visible only through the blur and cannot be clicked. Running and
// finishing every animation first measures the resting position, not an entrance frame.

/** Surfaces Conductor portals above the page: dialog, drawer and floating content. */
export const OVERLAY_SURFACES = [
  ".cdt-dialog",
  ".cdt-drawer",
  ".cdt-popover",
  ".cdt-menu",
  ".cdt-tooltip",
  ".cdt-select__content",
] as const;

const finishAnimations = (document: Document): void => {
  for (const animation of document.getAnimations()) {
    // Spinners loop forever and have no end to jump to; they never move a surface.
    if (animation.effect?.getComputedTiming().endTime !== Infinity) animation.finish();
  }
};

/** Lists every open surface that something else covers at its centre, with what covers it. */
export function stackingViolations(root: Document, scope: string): string[] {
  finishAnimations(root);
  const violations: string[] = [];
  for (const selector of OVERLAY_SURFACES) {
    for (const surface of root.querySelectorAll<HTMLElement>(selector)) {
      const box = surface.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const hit = root.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      if (hit === null || surface.contains(hit)) continue;
      violations.push(`${scope}: ${selector} is covered by ${hit.tagName.toLowerCase()}.${hit.className}`);
    }
  }
  return violations;
}
