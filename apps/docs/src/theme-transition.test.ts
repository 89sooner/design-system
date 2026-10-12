// Refs: CR-047 FR-DOC-005 FR-CSS-005
/* cdt-allow-literal: fixture token values and pixel coordinates are the inputs under test */
import { describe, expect, test, vi } from "vitest";
import { centreOf, motionTiming, revealKeyframes, revealRadius, revealTheme } from "./theme-transition";

function fakeWindow(motion: string, startViewTransition?: (update: () => void) => { ready: Promise<void> }) {
  const animate = vi.fn();
  const documentElement = { animate } as unknown as HTMLElement;
  const documentLike = { documentElement, startViewTransition } as unknown as Document;
  const windowLike = {
    document: documentLike,
    innerWidth: 1000,
    innerHeight: 600,
    getComputedStyle: () => ({ getPropertyValue: () => motion }),
  } as unknown as Window;
  return { windowLike, animate };
}

describe("CR-047 theme reveal", () => {
  test("motion token values split into Web Animations timing", () => {
    expect(motionTiming("420ms cubic-bezier(0.05, 0.7, 0.1, 1)")).toEqual({ duration: 420, easing: "cubic-bezier(0.05, 0.7, 0.1, 1)" });
    expect(motionTiming(".42s linear")).toEqual({ duration: 420, easing: "linear" });
    expect(motionTiming("0s cubic-bezier(0.05, 0.7, 0.1, 1)")?.duration).toBe(0);
    expect(motionTiming("")).toBeNull();
  });

  test("the circle reaches the farthest viewport corner", () => {
    expect(revealRadius({ x: 900, y: 20 }, { width: 1000, height: 600 })).toBeCloseTo(Math.hypot(900, 580));
    expect(revealKeyframes({ x: 10.4, y: 20.6 }, 99.2)).toEqual(["circle(0 at 10px 21px)", "circle(100px at 10px 21px)"]);
  });

  test("FR-CSS-005: a zeroed motion token swaps the theme in place, without a view transition", () => {
    const start = vi.fn();
    const { windowLike } = fakeWindow("0s cubic-bezier(0.05, 0.7, 0.1, 1)", start);
    const update = vi.fn();
    revealTheme(update, { x: 1, y: 1 }, windowLike);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
  });

  test("browsers without startViewTransition, or a missing origin, still apply the update", () => {
    const update = vi.fn();
    revealTheme(update, { x: 1, y: 1 }, fakeWindow("420ms ease").windowLike);
    revealTheme(update, null, fakeWindow("420ms ease", vi.fn()).windowLike);
    expect(update).toHaveBeenCalledTimes(2);
  });

  test("with motion allowed the update runs inside the transition and the new snapshot is clipped", async () => {
    let ready!: () => void;
    const start = vi.fn((update: () => void) => { update(); return { ready: new Promise<void>((resolve) => { ready = resolve; }) }; });
    const { windowLike, animate } = fakeWindow("420ms cubic-bezier(0.05, 0.7, 0.1, 1)", start);
    const update = vi.fn();
    revealTheme(update, { x: 900, y: 20 }, windowLike);
    expect(update).toHaveBeenCalledOnce();
    ready();
    await Promise.resolve(); await Promise.resolve();
    expect(animate).toHaveBeenCalledWith(
      { clipPath: ["circle(0 at 900px 20px)", `circle(${Math.ceil(Math.hypot(900, 580))}px at 900px 20px)`] },
      { duration: 420, easing: "cubic-bezier(0.05, 0.7, 0.1, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });

  test("an element without a box yields no origin", () => {
    expect(centreOf(null)).toBeNull();
    const box = (width: number) => ({ getBoundingClientRect: () => ({ left: 10, top: 20, width, height: width }) }) as unknown as Element;
    expect(centreOf(box(0))).toBeNull();
    expect(centreOf(box(10))).toEqual({ x: 15, y: 25 });
  });
});
