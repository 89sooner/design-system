// Refs: CR-047 W-001
/* cdt-allow-literal: pixel coordinates are the inputs under test */
import { describe, expect, test } from "vitest";
import { spotlightPosition, trackSpotlight } from "./pointer-spotlight";

describe("CR-047 pointer spotlight", () => {
  test("the glow centre is the pointer position relative to the surface", () => {
    expect(spotlightPosition({ clientX: 130.6, clientY: 48.2 }, { left: 30, top: 40 })).toEqual({ "--docs-spot-x": "101px", "--docs-spot-y": "8px" });
  });

  test("only mouse input moves the glow", () => {
    const written: string[] = [];
    const currentTarget = { getBoundingClientRect: () => ({ left: 0, top: 0 }), style: { setProperty: (name: string, value: string) => written.push(`${name}=${value}`) } };
    trackSpotlight({ pointerType: "touch", clientX: 5, clientY: 5, currentTarget } as never);
    expect(written).toEqual([]);
    trackSpotlight({ pointerType: "mouse", clientX: 5, clientY: 6, currentTarget } as never);
    expect(written).toEqual(["--docs-spot-x=5px", "--docs-spot-y=6px"]);
  });
});
