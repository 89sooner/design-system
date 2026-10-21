import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bundleHeader, entrySource } from "../lib/bundle.mjs";
import { componentReadme, toDeclarations } from "../lib/docs.mjs";
import { extractPreviewSource, pickRules } from "../lib/previews.mjs";
import { declaredNames, toBundleCss, withoutDeclarations } from "../lib/stylesheet.mjs";
import { colorValue, duplicateNames, familyOf, toArtifactTokens } from "../lib/tokens.mjs";

const token = (key, dark, light = dark, extra = {}) => ({
  key,
  cssName: `--cdt-${key.replaceAll(".", "-").replace(/-DEFAULT$/, "")}`,
  tier: "semantic",
  description: `${key} description.`,
  values: { dark, light },
  ...extra,
});

const SOURCE = {
  themes: ["dark", "light"],
  tokens: [
    token("surface.base", "#080B12", "#e8ecf2"),
    token("accent.DEFAULT", "#6d7cff", "#4f5bd5"),
    token("status.running", "#6d7cff", "#4f5bd5", { alias: "accent.DEFAULT" }),
    token("card.background", "rgba(16, 23, 34, 0.82)", "#ffffff", { alias: "surface.base" }),
    token("elevation.raised", "0 12px 30px rgba(0, 0, 0, 0.18)", "0 12px 30px rgba(12, 18, 28, 0.08)"),
    token("space.1", "4px"),
    token("radius.pill", "9999px"),
    token("z.popover", "50"),
    token("font.size.md", "14px"),
    token("font.lineHeight.md", "21px"),
    token("font.sans", "Inter, sans-serif"),
    token("font.mono", "'JetBrains Mono', monospace"),
    token("motion.fast", "140ms cubic-bezier(0.2, 0, 0, 1)"),
    token("button.ghost.border", "transparent"),
    token("overlay.backgroundBlur", "16px", "0px"),
    token("appShell.background", "radial-gradient(circle, #080b12, transparent 34rem)"),
    token("page.splitAsideWidth", "minmax(280px, 340px)"),
    // The rest of the type scale the Typography view is built from.
    ...["xl", "lg", "base", "sm", "xs", "2xs"].flatMap((step) => [token(`font.size.${step}`, "12px"), token(`font.lineHeight.${step}`, "18px")]),
    ...["headingSize", "headingLineHeight", "sectionHeadingSize", "sectionHeadingLineHeight", "subHeadingSize", "subHeadingLineHeight", "leadSize", "leadLineHeight"].map((name) => token(`page.${name}`, "20px")),
  ],
};

describe("tokens", () => {
  it("files each token in the family the artifact can hold, or keeps it in the stylesheet", () => {
    const families = Object.fromEntries(SOURCE.tokens.map((entry) => [entry.key, familyOf(entry)]));
    expect(families).toMatchObject({
      "surface.base": "color",
      "elevation.raised": "shadow",
      "space.1": "spacing",
      "radius.pill": "radius",
      "z.popover": "zIndex",
      "font.size.md": "fontScale",
      "page.splitAsideWidth": "layout",
      "font.sans": "stylesheet",
      "motion.fast": "stylesheet",
      "button.ghost.border": "stylesheet",
      "overlay.backgroundBlur": "stylesheet",
      "appShell.background": "stylesheet",
    });
  });

  it("keeps a colour alias only in the themes where it still resolves to the same value", () => {
    const byKey = new Map(SOURCE.tokens.map((entry) => [entry.key, entry]));
    expect(colorValue(byKey.get("status.running"), byKey)).toEqual({ dark: "{cdt-accent}", light: "{cdt-accent}" });
    expect(colorValue(byKey.get("card.background"), byKey)).toEqual({ dark: "rgba(16, 23, 34, 0.82)", light: "#ffffff" });
    expect(colorValue(byKey.get("surface.base"), byKey).dark).toBe("#080b12");
  });

  it("puts the canonical dark theme first and records the provenance", () => {
    const { tokens, declared } = toArtifactTokens(SOURCE, { ref: "main@abc1234", synced: "2026-10-21" });
    expect(tokens.color.themes.map((theme) => theme.id)).toEqual(["dark", "light"]);
    expect(tokens.meta).toMatchObject({ source: "github", ref: "main@abc1234", synced: "2026-10-21" });
    expect(declared).toContain("--cdt-space-1");
    expect(declared).not.toContain("--cdt-motion-fast");
    expect(duplicateNames(tokens)).toEqual([]);
  });
});

describe("stylesheet", () => {
  const css = ':root,[data-cdt-theme=dark]{--cdt-space-1:4px;--cdt-motion-fast:.14s ease}.cdt-btn{padding:var(--cdt-space-1)}';

  it("drops the declarations tokens.json owns and keeps their uses", () => {
    const result = withoutDeclarations(css, ["--cdt-space-1"]);
    expect(declaredNames(result)).toEqual(["--cdt-motion-fast"]);
    expect(result).toContain("var(--cdt-space-1)");
  });

  it("selects themes with the artifact's data-theme attribute", () => {
    const [, body] = toBundleCss([css], []).split("\n");
    expect(body).toContain("[data-theme=dark]");
    expect(body).not.toContain("data-cdt-theme");
  });

  it("refuses a stylesheet that would close its inline <style>", () => {
    expect(() => toBundleCss(["a{content:'</style>'}"], [])).toThrow();
  });
});

describe("components", () => {
  it("names every component in the bundle header", () => {
    expect(bundleHeader("Conductor", ["Button", "Card"])).toBe('/* @ds-bundle: {"format":4,"namespace":"Conductor","components":[{"name":"Button"},{"name":"Card"}]} */\n');
    expect(entrySource({ reactEntry: "/r.js", tokensEntry: "/t.js" })).toContain('export * from "/r.js"');
  });

  it("still finds the docs catalog previews it compiles", () => {
    const catalog = readFileSync(new URL("../../../apps/docs/src/catalog.tsx", import.meta.url), "utf8");
    const source = extractPreviewSource(catalog);
    expect(source.startsWith("const previewOptions")).toBe(true);
    expect(source).toContain("function ComponentPreview");
    expect(source).not.toContain("export function");
    expect(source.trimEnd().endsWith("}")).toBe(true);
  });

  it("copies only the docs layout rules the previews own", () => {
    const css = ".docs-meter { display: grid; }\n.docs-console .docs-meter { max-width: none; }\n.docs-preview-card strong { font-size: 16px; }";
    expect(pickRules([css], ["docs-meter", "docs-preview-card"])).toBe(".docs-meter{display: grid;}.docs-preview-card strong{font-size: 16px;}");
  });

  it("writes guidelines whose first sentence is the purpose", () => {
    const readme = componentReadme({
      name: "Kbd",
      family: "Data",
      className: "cdt-kbd",
      propsTypeName: "KbdProps",
      props: [{ name: "children", required: true, type: "ReactNode" }],
      guidance: { purpose: "Shows a keyboard key.", use: ["Use in hints."], avoid: [{ rule: "Do not nest.", instead: "Badge" }], keyboard: "static", accessibility: ["Plain text."] },
    });
    expect(readme.split("\n")[2]).toBe("Shows a keyboard key.");
    expect(readme).toContain("Use `Badge` instead.");
    expect(readme).toContain("| `children` | `ReactNode` | yes |");
  });

  it("turns the API Extractor report into a types file", () => {
    const dts = toDeclarations("# Report\n\n```ts\nexport const Button: unknown;\n```\n", { statusIcons: { running: "loader" }, severityIcons: { read: "eye" } });
    expect(dts).toContain("export const Button: unknown;");
    expect(dts).toContain('STATUS_ICONS: { readonly running: "loader" }');
  });
});
