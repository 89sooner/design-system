// Refs: CR-047 FR-DOC-005 FR-CSS-005
//
// The theme switch reveals the new palette as a circle growing from the switch, using the View
// Transitions API. Duration and easing are read from the live `--cdt-motion-slow` token, so the
// reduced-motion block (which zeroes every motion token) turns the reveal off with no second check,
// and a browser without `startViewTransition` simply swaps the theme in place.

export interface MotionTiming {
  readonly duration: number;
  readonly easing: string;
}

export interface RevealOrigin {
  readonly x: number;
  readonly y: number;
}

/** Splits a motion token value such as `420ms cubic-bezier(...)` into Web Animations timing. */
export function motionTiming(value: string): MotionTiming | null {
  const match = /^\s*(\d*\.?\d+)(ms|s)(?:\s+(.+?))?\s*$/.exec(value);
  if (match === null) return null;
  const duration = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return { duration, easing: match[3] ?? "linear" };
}

/** The radius that covers the whole viewport from `origin`: the distance to its farthest corner. */
export function revealRadius(origin: RevealOrigin, viewport: { readonly width: number; readonly height: number }): number {
  return Math.hypot(Math.max(origin.x, viewport.width - origin.x), Math.max(origin.y, viewport.height - origin.y));
}

/** The two `clip-path` keyframes of the reveal, in CSS pixel units. */
export function revealKeyframes(origin: RevealOrigin, radius: number): [string, string] {
  const at = `at ${Math.round(origin.x)}px ${Math.round(origin.y)}px`;
  return [`circle(0 ${at})`, `circle(${Math.ceil(radius)}px ${at})`];
}

interface ViewTransitionLike {
  readonly ready: Promise<void>;
}

type TransitionDocument = Document & { startViewTransition?: (update: () => void) => ViewTransitionLike };

/** Runs `update` (which must change the DOM synchronously) inside a circular reveal when motion is allowed. */
export function revealTheme(update: () => void, origin: RevealOrigin | null, windowLike: Window = window): void {
  const documentLike = windowLike.document as TransitionDocument;
  const timing = motionTiming(windowLike.getComputedStyle(documentLike.documentElement).getPropertyValue("--cdt-motion-slow"));
  if (origin === null || timing === null || timing.duration === 0 || typeof documentLike.startViewTransition !== "function") {
    update();
    return;
  }
  const transition = documentLike.startViewTransition(update);
  transition.ready
    .then(() => {
      const radius = revealRadius(origin, { width: windowLike.innerWidth, height: windowLike.innerHeight });
      documentLike.documentElement.animate(
        { clipPath: revealKeyframes(origin, radius) },
        { duration: timing.duration, easing: timing.easing, pseudoElement: "::view-transition-new(root)" },
      );
    })
    // A transition skipped by the browser (hidden tab, a second toggle mid-reveal) has already applied the update.
    .catch(() => undefined);
}

/** The centre of an element, or null when it is absent or has no box (the reveal then falls back to an in-place swap). */
export function centreOf(element: Element | null): RevealOrigin | null {
  if (element === null) return null;
  const box = element.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return null;
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
