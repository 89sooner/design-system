import { describe, expect, test } from "vitest";
import { breakpoints } from "./breakpoints";
import { buildTokens } from "./build";
import { TokenBuildError } from "./build/errors";
import {
  assertNoBreakpointVarsInMedia,
  findBreakpointVarsInMedia,
  substituteBreakpoints,
} from "./build/media";
import { assertDistinctZLayers } from "./build/validate";
import { componentTokens } from "./components";
import { BREAKPOINT_PX, FONT_SIZE_PX, Z_LAYERS, scaleTokens } from "./scales";

const byKey = new Map(scaleTokens.map((token) => [token.key, token]));
const componentByKey = new Map(componentTokens.map((token) => [token.key, token]));
const css = buildTokens({ outDir: "unused", report: true }).css;

describe("typography scale", () => {
  test("FR-TOK-007 AC-1: `font.size` has exactly seven steps at 10/11/12/13/14/16/20px", () => {
    expect(FONT_SIZE_PX).toEqual({ "2xs": 10, xs: 11, sm: 12, base: 13, md: 14, lg: 16, xl: 20 });

    for (const [step, pixels] of Object.entries(FONT_SIZE_PX)) {
      expect(byKey.get(`font.size.${step}`)?.value).toBe(`${pixels}px`);
    }
  });

  test("FR-TOK-007 AC-2: every `font.size` step has a matching `font.lineHeight` token", () => {
    const sizes = scaleTokens.filter((token) => token.key.startsWith("font.size."));
    const lineHeights = scaleTokens.filter((token) => token.key.startsWith("font.lineHeight."));

    expect(sizes).toHaveLength(7);
    expect(lineHeights).toHaveLength(7);
    for (const step of Object.keys(FONT_SIZE_PX)) {
      expect(byKey.has(`font.lineHeight.${step}`)).toBe(true);
    }
  });

  test("FR-TOK-007 AC-2: line heights are the half-up rounding of size × ratio (tokens spec 5.9.2)", () => {
    const expected = { "2xs": 14, xs: 16, sm: 18, base: 20, md: 21, lg: 24, xl: 26 };

    for (const [step, pixels] of Object.entries(expected)) {
      expect(byKey.get(`font.lineHeight.${step}`)?.value).toBe(`${pixels}px`);
    }
  });

  test("FR-TOK-007 AC-4: `page.headingSize` derives its clamp bounds from `font.size.xl`", () => {
    expect(css).toContain("--cdt-page-heading-size: clamp(24px, 3vw, 32px);");
  });
});

describe("radius scale", () => {
  test("FR-CSS-004: `radius.pill` resolves the shared fully-rounded component contract", () => {
    expect(byKey.get("radius.pill")?.value).toBe("9999px");
    expect(css).toContain("--cdt-radius-pill: 9999px;");
  });
});

describe("border width scale", () => {
  test("CR-034: three line weights exist and resolve to the stroke primitives", () => {
    const weights = { hairline: "1px", emphasis: "2px", rail: "3px" } as const;
    for (const [step, expected] of Object.entries(weights)) {
      expect(byKey.get(`border.width.${step}`)?.alias).toBe(`stroke.${expected.replace("px", "")}`);
      expect(css).toContain(`--cdt-border-width-${step}: ${expected};`);
    }
  });

  test("CR-034: the component tokens that carried a 2px literal now reference the scale", () => {
    for (const key of ["table.headerBorderWidth", "badge.marker.dotRingWidth"]) {
      expect(componentByKey.get(key)?.alias).toBe("border.width.emphasis");
      expect(componentByKey.get(key)?.value).toBeUndefined();
    }
  });
});

describe("heading scale", () => {
  test("CR-034: `h2` and `h3` derive from `font.size.xl` without widening the seven-step scale", () => {
    // 20 × 1.3 and 20 × 1.1, then the 1.30 heading ratio at the same half-up rounding.
    expect(componentByKey.get("page.sectionHeadingSize")?.value).toBe("26px");
    expect(componentByKey.get("page.sectionHeadingLineHeight")?.value).toBe("34px");
    expect(componentByKey.get("page.subHeadingSize")?.value).toBe("22px");
    expect(componentByKey.get("page.subHeadingLineHeight")?.value).toBe("29px");
    expect(css).toContain("--cdt-page-section-heading-size: 26px;");
    expect(css).toContain("--cdt-page-sub-heading-size: 22px;");

    // The exposed type scale is unchanged: the headings live in the component tier.
    expect([...byKey.keys()].filter((key) => key.startsWith("font.size."))).toHaveLength(7);
  });
});

describe("z-index scale", () => {
  test("FR-TOK-008 AC-1: `z` has exactly six layers at 0/10/20/30/40/50", () => {
    expect(Z_LAYERS).toEqual({ base: 0, raised: 10, sticky: 20, drawer: 30, overlay: 40, popover: 50 });

    for (const [layer, order] of Object.entries(Z_LAYERS)) {
      expect(byKey.get(`z.${layer}`)?.value).toBe(order);
    }
  });

  test("FR-TOK-008 AC-3: no two layers share a value", () => {
    const values = Object.values(Z_LAYERS);
    expect(new Set(values).size).toBe(values.length);
  });

  test("FR-TOK-008 AC-3: two layers resolving to the same value fail the build and print both keys", () => {
    const duplicated = new Map([
      ["z.drawer", "30"],
      ["z.overlay", "30"],
    ]);

    try {
      assertDistinctZLayers(duplicated);
      throw new Error("expected the duplicate-layer checker to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-Z-DUPLICATE");
      const message = (error as TokenBuildError).format();
      expect(message).toContain("z.drawer");
      expect(message).toContain("z.overlay");
    }
  });

  test("FR-TOK-008 exception handling: the scale stops at `z.popover` (50)", () => {
    expect(Math.max(...Object.values(Z_LAYERS))).toBe(50);
  });
});

describe("breakpoint scale", () => {
  test("FR-TOK-009 AC-1: `breakpoint` has exactly three steps at 560/800/1080px", () => {
    expect(BREAKPOINT_PX).toEqual({ sm: 560, md: 800, lg: 1080 });

    for (const [name, pixels] of Object.entries(BREAKPOINT_PX)) {
      expect(byKey.get(`breakpoint.${name}`)?.value).toBe(`${pixels}px`);
    }
  });

  test("FR-TOK-009 AC-3: the `breakpoints` export matches the token values", () => {
    expect(breakpoints).toEqual(BREAKPOINT_PX);
  });

  test("FR-TOK-009 AC-2: a breakpoint custom property inside `@media` is substituted for a literal", () => {
    const input = "@media (max-width: var(--cdt-breakpoint-md)) { .cdt-split-layout { display: block; } }";

    expect(substituteBreakpoints(input)).toContain("@media (max-width: 800px)");
    expect(substituteBreakpoints(input)).not.toContain("var(--cdt-breakpoint-md)");
  });

  test("FR-TOK-009 AC-2: a `{breakpoint.sm}` reference inside `@media` is substituted for a literal", () => {
    const input = "@media (max-width: {breakpoint.sm}) { .cdt-card-grid { grid-template-columns: 1fr; } }";

    expect(substituteBreakpoints(input)).toContain("@media (max-width: 560px)");
  });

  test("FR-TOK-009 AC-2: substitution leaves breakpoint properties outside `@media` alone", () => {
    const input = ".cdt-table { --local: var(--cdt-breakpoint-md); }";
    expect(substituteBreakpoints(input)).toBe(input);
  });

  test("FR-TOK-009 AC-2: an unsubstituted breakpoint property inside `@media` fails the build", () => {
    const unsubstituted = "@media (min-width: var(--cdt-breakpoint-lg)) { .a { color: red; } }";

    expect(findBreakpointVarsInMedia(unsubstituted)).toHaveLength(1);
    try {
      assertNoBreakpointVarsInMedia(unsubstituted);
      throw new Error("expected the media checker to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-MEDIA-VAR");
      expect((error as TokenBuildError).exitCode).toBe(2);
    }
  });

  test("FR-TOK-009 AC-2: the emitted tokens.css contains no `var(--cdt-breakpoint-*)` inside `@media`", () => {
    expect(findBreakpointVarsInMedia(css)).toEqual([]);
  });
});
