// Fault injection for the build's static gates. A gate that has never been seen
// to fail is indistinguishable from no gate at all (CR-009, CR-010).
import { describe, expect, test } from "vitest";
import * as checks from "../checks.mjs";
import { LAYER_NAMES, inspectBundle } from "../checks.mjs";
import { readBuilt } from "./helpers.js";

const codesFor = (css: string): string[] =>
  inspectBundle(css, "fixture.css").map((violation) => violation.code);

describe("inspectBundle catches what it claims to catch", () => {
  test("FR-CSS-001 AC-2: !important inside a layer is a violation", () => {
    expect(codesFor("@layer cdt.reset{.a{color:red!important}}")).toEqual(["CSS-IMPORTANT"]);
  });

  test("FR-CSS-001 AC-1: a rule outside every layer is a violation", () => {
    expect(codesFor(".a{color:red}")).toEqual(["CSS-UNLAYERED"]);
  });

  test("FR-CSS-001 AC-1: a rule in an undeclared layer is a violation", () => {
    expect(codesFor("@layer cdt.nope{.a{color:red}}")).toEqual(["CSS-UNKNOWN-LAYER"]);
  });

  test("FR-CSS-001 AC-1: a media query cannot smuggle a rule out of its layer", () => {
    expect(codesFor("@media (min-width:40em){.a{color:red}}")).toEqual(["CSS-UNLAYERED"]);
    expect(codesFor("@layer cdt.base{@media (min-width:40em){.a{color:red}}}")).toEqual([]);
  });

  test("FR-CSS-002 AC-4: a surviving @import is a violation", () => {
    expect(codesFor('@import url("https://fonts.example.com/x.css");')).toEqual([
      "CSS-REMOTE-FONT",
    ]);
  });

  test("FR-CSS-002 AC-4: a remote font src is a violation", () => {
    const css = "@layer cdt.base{@font-face{font-family:x;src:url(https://f.example.com/a.woff2)}}";
    expect(codesFor(css)).toEqual(["CSS-REMOTE-FONT"]);
  });

  test("FR-CSS-002 AC-4: a protocol-relative url is a violation", () => {
    const css = "@layer cdt.base{@font-face{font-family:x;src:url(//f.example.com/a.woff2)}}";
    expect(codesFor(css)).toEqual(["CSS-REMOTE-FONT"]);
  });

  test("R-5: an unprefixed custom property is a violation", () => {
    expect(codesFor("@layer cdt.base{:root{--not-cdt:1}}")).toEqual(["CSS-CUSTOM-PROPERTY"]);
    expect(codesFor("@layer cdt.base{:root{--cdt-ok:1}}")).toEqual([]);
  });

  test("FR-TOK-009 AC-2: a breakpoint custom property cannot survive in a media query", () => {
    const css = "@layer cdt.layout{@media (max-width:var(--cdt-breakpoint-md)){.a{display:block}}}";
    expect(codesFor(css)).toEqual(["CSS-MEDIA-VAR"]);
  });

  test("a violation reports its code, position and hint", () => {
    const [violation] = inspectBundle("@layer cdt.reset{.a{color:red!important}}", "dist/x.css");
    expect(violation).toMatchObject({
      code: "CSS-IMPORTANT",
      filename: "dist/x.css",
      line: 1,
    });
    expect(violation?.message).toContain("color");
    expect(violation?.hint).toContain("@layer");
  });

  test("the shipped bundles are clean", () => {
    expect(inspectBundle(readBuilt("../dist/index.css"), "index.css")).toEqual([]);
    expect(inspectBundle(readBuilt("../dist/component.css"), "component.css")).toEqual([]);
  });
});

describe("checks.d.mts tracks checks.mjs", () => {
  // `pnpm typecheck` type-checks against the hand-written checks.d.mts and never
  // compiles checks.mjs, so the declaration can drift from the implementation
  // without any gate noticing. These assertions are that gate.
  test("the runtime export surface matches the declaration", () => {
    expect(Object.keys(checks).sort()).toEqual([
      "LAYER_NAMES",
      "formatViolations",
      "inspectBundle",
    ]);
    expect(typeof checks.inspectBundle).toBe("function");
    expect(typeof checks.formatViolations).toBe("function");
  });

  test("LAYER_NAMES is the declared five, in cascade order", () => {
    expect([...LAYER_NAMES]).toEqual([
      "cdt.reset",
      "cdt.base",
      "cdt.layout",
      "cdt.component",
      "cdt.utility",
    ]);
    expect(Object.isFrozen(LAYER_NAMES)).toBe(true);
  });
});
