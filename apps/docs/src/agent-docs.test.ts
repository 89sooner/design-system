// Refs: WP-034 CR-048 FR-DOC-008 API-DOC-002
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { DESIGN_MD_MAX_BYTES, cell, normaliseBase, renderComponentMd, renderDesignMd, renderLlmsTxt, renderTokensMd, type AgentToken, type ContrastSummary } from "../scripts/agent-docs.mjs";
import type { ComponentMeta } from "./catalog";

// The same build artifacts build-agent-docs.mjs reads. CI runs `pnpm build` before `pnpm test`, and
// the workspace alias maps `@conductor-by-89soone/tokens` to its source, so read the files directly.
const readJson = <T,>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
const tokenArtifact = readJson<{ themes: string[]; tokens: AgentToken[] }>("../../../packages/tokens/dist/tokens.json");
const contrast = readJson<ContrastSummary>("../../../packages/tokens/dist/contrast-report.json");
const componentMeta = readJson<ComponentMeta[]>("./generated/component-meta.json");

const tokens = tokenArtifact.tokens;
const themes = tokenArtifact.themes;
const version = "0.0.0-test";
const design = renderDesignMd({ tokens, themes, contrast, components: componentMeta, version });

/** The YAML front matter as key → value lines under one indented parent (enough for this flat shape). */
function frontMatter(markdown: string): string {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (match === null) throw new Error("no front matter");
  return match[1] ?? "";
}

describe("FR-DOC-008 agent-readable docs", () => {
  test("AC-1: DESIGN.md front matter carries every semantic colour per theme straight from tokens.json", () => {
    const yaml = frontMatter(design);
    for (const theme of themes) expect(yaml).toContain(`\n  ${theme}:\n`);
    const surface = tokens.find((token) => token.key === "surface.base");
    expect(surface).toBeDefined();
    for (const theme of themes) expect(yaml).toContain(`    "surface.base": ${JSON.stringify(surface?.values[theme])}`);
    // Every value line is a quoted key and a quoted value — nothing hand-written slips in unquoted.
    for (const line of yaml.split("\n").filter((entry) => entry.startsWith("    "))) expect(line).toMatch(/^ {4}"[^"]+": "[^"]*"$/);
    const colourLines = yaml.split("\n").filter((entry) => entry.startsWith("    ")).length;
    const semanticColours = tokens.filter((token) => token.tier === "semantic" && Object.values(token.values).every((value) => /^(?:#|rgba?\()/.test(value)));
    expect(colourLines).toBe(semanticColours.length * themes.length);
  });

  test("AC-1: typography, spacing, radius, motion and breakpoints come from the token artifact", () => {
    const yaml = frontMatter(design);
    for (const group of ["typography", "spacing", "radius", "motion", "breakpoints"]) expect(yaml).toMatch(new RegExp(`^${group}:$`, "m"));
    const spring = tokens.find((token) => token.key === "motion.spring");
    expect(yaml).toContain(`  "motion.spring": ${JSON.stringify(spring?.values.dark)}`);
  });

  test("AC-4: DESIGN.md stays under the size limit and the limit is enforced", () => {
    expect(new TextEncoder().encode(design).length).toBeLessThanOrEqual(DESIGN_MD_MAX_BYTES);
    const bloated = componentMeta.map((component) => ({ ...component, guidance: { ...component.guidance, purpose: "x".repeat(2000) } }));
    expect(() => renderDesignMd({ tokens, themes, contrast, components: bloated, version })).toThrow(/DOC-AGENT/);
    expect(() => renderDesignMd({ tokens: [], themes, contrast, components: componentMeta, version })).toThrow(/DOC-AGENT/);
  });

  test("AC-2: one Markdown page per public component, rendered from ComponentMeta and its guidance", () => {
    const button = componentMeta.find((component) => component.name === "Button");
    expect(button).toBeDefined();
    if (button === undefined) return;
    const page = renderComponentMd(button, { base: "/design-system/" });
    expect(page).toMatch(/^# Button\n\n> /);
    expect(page).toContain(button.guidance.purpose);
    expect(page).toContain("`cdt-btn`");
    for (const prop of button.props) expect(page).toContain(`\`${prop.name}\``);
    expect(page).toContain("## Keyboard\n\n| Keys | Action |");
    expect(page).toContain("[Live page](/design-system/#/components/Button)");
    const card = componentMeta.find((component) => component.guidance.keyboard === "static");
    if (card !== undefined) expect(renderComponentMd(card, { base: "/" })).toContain("No keyboard interaction of its own");
    // Avoid rules link to the alternative's own page.
    const withInstead = componentMeta.find((component) => component.guidance.avoid.some((rule) => rule.instead !== undefined));
    const instead = withInstead?.guidance.avoid.find((rule) => rule.instead !== undefined)?.instead;
    if (withInstead !== undefined) expect(renderComponentMd(withInstead, { base: "/" })).toContain(`[${instead}](${instead}.md)`);
  });

  test("AC-3: llms.txt follows llmstxt.org and links every generated page under DOCS_BASE", () => {
    const base = normaliseBase("design-system");
    const llms = renderLlmsTxt({ components: componentMeta, base, version });
    expect(llms).toMatch(/^# Conductor Design System\n\n> .+\n/);
    expect(llms).toMatch(/^## Start here$/m);
    expect(llms).toMatch(/^## Components$/m);
    expect(llms).toContain("[DESIGN.md](/design-system/DESIGN.md)");
    expect(llms).toContain("[Tokens](/design-system/tokens.md)");
    const links = [...llms.matchAll(/\]\((\/design-system\/components\/[A-Za-z]+\.md)\)/g)];
    expect(links).toHaveLength(componentMeta.length);
    expect(llms).not.toMatch(/https?:\/\//);
  });

  test("tokens.md lists every token with both theme values; table cells cannot be split by a pipe", () => {
    const table = renderTokensMd({ tokens, themes, version });
    expect(table.split("\n").filter((line) => line.startsWith("| `"))).toHaveLength(tokens.length);
    expect(cell("ReactNode | undefined")).toBe("ReactNode \\| undefined");
    expect(cell("a\nb")).toBe("a b");
  });

  test("normaliseBase handles the Pages base and the root", () => {
    expect(normaliseBase(undefined)).toBe("/");
    expect(normaliseBase("/design-system/")).toBe("/design-system/");
    expect(normaliseBase("/")).toBe("/");
  });

  test("FR-DOC-003 AC-6: every public component carries complete guidance", () => {
    const source = JSON.parse(readFileSync(new URL("./content/component-guidance.json", import.meta.url), "utf8")) as Record<string, unknown>;
    expect(Object.keys(source).sort()).toEqual(componentMeta.map((component) => component.name).sort());
    for (const component of componentMeta) {
      expect(component.guidance.purpose.length).toBeGreaterThan(0);
      expect(component.guidance.use.length).toBeGreaterThan(0);
      expect(component.guidance.avoid.length).toBeGreaterThan(0);
      expect(component.guidance.accessibility.length).toBeGreaterThan(0);
    }
  });
});
