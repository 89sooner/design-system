/**
 * The committed public-surface baseline catches what API Extractor cannot: a `cdt-*` class, a `data-*` selector,
 * the layer order, an entry point or a CLI name that disappears or changes (CR-075 FR-DX-006 AC-2, WP-041).
 *
 * Refs: CR-075 FR-DX-006 WP-041
 */
import { describe, expect, test } from "vitest";
import { cssSurface, packageSurface, renderSurface, surfaceDiff } from "./public-surface.mjs";

const CSS = `/* .cdt-commented-out */@layer cdt.reset, cdt.base, cdt.component;
@layer cdt.component{.cdt-btn{color:red}.cdt-btn--primary:not(.cdt-btn--ghost){color:blue}.cdt-tabs__trigger[data-state=active]{x:y}[data-cdt-theme=light] .cdt-card{x:y}}`;

const report = (css, manifest = { name: "@conductor-by-89soone/css", exports: { ".": {}, "./component.css": {} } }) =>
  renderSurface({ packages: [{ name: manifest.name, manifest }], stylesheets: [{ file: "index.css", css }] });

describe("FR-DX-006 AC-2: public surface report", () => {
  test("reads classes, data attributes and the layer order from built CSS, ignoring comments", () => {
    expect(cssSurface(CSS)).toEqual({
      layers: ["cdt.reset", "cdt.base", "cdt.component"],
      classes: ["cdt-btn", "cdt-btn--ghost", "cdt-btn--primary", "cdt-card", "cdt-tabs__trigger"],
      dataAttributes: ["data-cdt-theme", "data-state"],
    });
  });

  test("reads entry points and CLI names from a manifest", () => {
    expect(packageSurface({ name: "x", exports: { "./b": {}, ".": {} }, bin: { tool: "./bin.mjs" } })).toEqual({ name: "x", exports: [".", "./b"], bin: ["tool"] });
  });

  test("renders the same bytes for the same input", () => {
    expect(report(CSS)).toBe(report(CSS));
  });

  test("a deleted class is reported as removed", () => {
    const { removed, added } = surfaceDiff(report(CSS), report(CSS.replace(".cdt-card", ".other")));
    expect(removed).toEqual(["index.css classes: cdt-card"]);
    expect(added).toEqual([]);
  });

  test("a renamed class is one removal and one addition", () => {
    expect(surfaceDiff(report(CSS), report(CSS.replaceAll("cdt-tabs__trigger", "cdt-tabs__tab")))).toEqual({
      removed: ["index.css classes: cdt-tabs__trigger"],
      added: ["index.css classes: cdt-tabs__tab"],
    });
  });

  test("a reordered layer statement and a dropped entry point are drift", () => {
    const reordered = report(CSS.replace("cdt.reset, cdt.base", "cdt.base, cdt.reset"), { name: "@conductor-by-89soone/css", exports: { ".": {} } });
    const { removed } = surfaceDiff(report(CSS), reordered);
    expect(removed).toEqual(["@conductor-by-89soone/css exports: ./component.css", "index.css layer order: cdt.reset, cdt.base, cdt.component"]);
  });

  test("a class that leaves one stylesheet but stays in another is still reported for that stylesheet", () => {
    const two = (second) => renderSurface({ packages: [], stylesheets: [{ file: "index.css", css: CSS }, { file: "agent.css", css: second }] });
    expect(surfaceDiff(two(".cdt-card{x:y}"), two(".cdt-other{x:y}")).removed).toEqual(["agent.css classes: cdt-card"]);
  });
});
