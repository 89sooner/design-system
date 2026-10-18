// Refs: WP-034 CR-048 FR-DOC-008 API-DOC-002
//
// Renderers for the agent-readable docs: DESIGN.md, llms.txt, tokens.md and one Markdown page per
// public component. Every value comes from the same artifacts the screens read (tokens.json,
// contrast-report.json, component-meta.json), so the Markdown and W-010~W-030 cannot disagree.
// Pure functions only; build-agent-docs.mjs does the file I/O. Typed by agent-docs.d.mts.

/** FR-DOC-008 AC-4: an agent loads DESIGN.md whole, so it stays well under one large context bite. */
export const DESIGN_MD_MAX_BYTES = 64 * 1024;

const COLOR_VALUE = /^(?:#|rgba?\(|hsla?\()/i;
const FRONT_MATTER_GROUPS = [
  ["typography", "font."],
  ["spacing", "space."],
  ["radius", "radius."],
  ["motion", "motion."],
  ["breakpoints", "breakpoint."],
];

/** `/design-system` or `design-system/` → `/design-system/`; empty → `/`. */
export function normaliseBase(base) {
  const trimmed = String(base ?? "").replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "/" : `/${trimmed}/`;
}

/** A Markdown table cell: pipes escaped, line breaks folded, so a TypeScript union cannot split a row. */
export function cell(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

/** A double-quoted YAML scalar (JSON strings are valid YAML). */
const yaml = (value) => JSON.stringify(String(value));

const semantic = (tokens) => tokens.filter((token) => token.tier === "semantic");
const isColor = (token) => Object.values(token.values).every((value) => COLOR_VALUE.test(value));

export function renderDesignMd({ tokens, themes, contrast, components, version }) {
  if (tokens.length === 0 || components.length === 0) throw new Error("error[DOC-AGENT]: DESIGN.md needs tokens and components");
  const colors = semantic(tokens).filter(isColor);
  const lines = ["---", `name: ${yaml("Conductor Design System")}`, `version: ${yaml(version)}`, `description: ${yaml("Dark-first tokens, a layered stylesheet and Radix-based React primitives for operational interfaces.")}`, `themes: [${themes.map(yaml).join(", ")}]`, `defaultTheme: ${yaml(themes[0])}`, "colors:"];
  for (const theme of themes) {
    lines.push(`  ${theme}:`);
    for (const token of colors) lines.push(`    ${yaml(token.key)}: ${yaml(token.values[theme])}`);
  }
  for (const [group, prefix] of FRONT_MATTER_GROUPS) {
    const members = semantic(tokens).filter((token) => token.key.startsWith(prefix));
    lines.push(`${group}:`);
    // These scales do not vary by theme; the canonical (first) theme's value is the value.
    for (const token of members) lines.push(`  ${yaml(token.key)}: ${yaml(token.values[themes[0]])}`);
  }
  lines.push("---", "");

  const { summary } = contrast;
  lines.push(
    "# Conductor Design System",
    "",
    `Version ${version}. Generated from the token source and component metadata at build time; do not edit by hand.`,
    "",
    "## Principles",
    "",
    "- **Tokens only.** Every colour, length and duration is a `--cdt-*` CSS custom property. Never write a colour, `px` length or `ms` duration literal in component or page styles; read the token instead.",
    `- **Dark is canonical.** The \`${themes[0]}\` palette is the reference; other themes supply the same semantic keys with different values.`,
    "- **Cascade layers, no `!important`.** The stylesheet declares `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility`. Unlayered consumer rules win by layer order.",
    "- **Accessibility is delegated to Radix UI.** Do not hand-roll focus traps, roles or keyboard navigation for overlays, menus, selects, tabs or switches.",
    "- **Status is never colour alone.** Status and severity always pair colour with an icon and a text label.",
    "",
    "## Using the system",
    "",
    "```tsx",
    'import "@conductor-by-89soone/css"; // once, in the entry file',
    'import "@conductor-by-89soone/css/agent.css"; // only where the Agent family (Conversation, Message, PromptInput, …) renders',
    'import { Button } from "@conductor-by-89soone/react";',
    "```",
    "",
    `Set the theme on the root element: \`<html data-cdt-theme="${themes[0]}">\`. Every component reads the current theme from the custom properties; nothing branches on the theme in JavaScript.`,
    "",
    "## Colour roles",
    "",
    "The `colors` front matter lists every semantic colour per theme. Pick by role, never by value:",
    "",
    "- `surface.*` for backgrounds, from `surface.base` (page) up through raised and overlay surfaces.",
    "- `text.*` for copy: `text.primary`, `text.secondary`, `text.muted`; `text.faint` is for meta text only.",
    "- `border.*` for edges; `border.control` outlines form controls.",
    "- `accent*` for the brand action colour and focus; `focusRing` is the shared focus indicator.",
    "- `status.*` and `severity.*` for state, always with an icon and a label.",
    "",
    `Contrast: ${summary.passed} of ${summary.checks} declared pairs pass WCAG 2.1 AA across ${themes.length} themes (body 4.5:1, large and non-text 3:1); ${summary.failed} fail.`,
    "",
    "## Motion",
    "",
    "Motion tokens bind a duration and an easing (`motion.fast`, `motion.standard`, `motion.slow`, `motion.spring`, `motion.exit`, …); `motion.stagger` is a bare delay step. Use them as `transition: opacity var(--cdt-motion-fast)` and never add a second easing. Under `prefers-reduced-motion: reduce` every motion token becomes `0s`.",
    "",
    "## Components",
    "",
    "| Component | Family | Root class | Purpose |",
    "| --- | --- | --- | --- |",
    ...components.map((component) => `| [${component.name}](components/${component.name}.md) | ${cell(component.family)} | \`${cell(component.className)}\` | ${cell(component.guidance.purpose)} |`),
    "",
    "Every component page lists its props, keyboard interactions and accessibility notes. `tokens.md` lists every token with both theme values.",
    "",
  );
  const markdown = lines.join("\n");
  const bytes = new TextEncoder().encode(markdown).length;
  if (bytes > DESIGN_MD_MAX_BYTES) throw new Error(`error[DOC-AGENT]: DESIGN.md is ${bytes} bytes, over the ${DESIGN_MD_MAX_BYTES}-byte limit (FR-DOC-008 AC-4)`);
  return markdown;
}

export function renderTokensMd({ tokens, themes, version }) {
  if (tokens.length === 0) throw new Error("error[DOC-AGENT]: tokens.md needs tokens");
  return [
    "# Conductor tokens",
    "",
    `Version ${version}. ${tokens.length} tokens; CSS name is \`--cdt-\` plus the key with dots as dashes.`,
    "",
    `| Key | Tier | ${themes.map((theme) => `${theme[0].toUpperCase()}${theme.slice(1)}`).join(" | ")} | Usage | Description |`,
    `| --- | --- | ${themes.map(() => "---").join(" | ")} | --- | --- |`,
    ...tokens.map((token) => `| \`${cell(token.key)}\` | ${cell(token.tier)} | ${themes.map((theme) => `\`${cell(token.values[theme])}\``).join(" | ")} | ${cell(token.usage ?? "")} | ${cell(token.description ?? "")} |`),
    "",
  ].join("\n");
}

export function renderComponentMd(component, { base }) {
  const { guidance } = component;
  const keyboard = guidance.keyboard === "static"
    ? ["No keyboard interaction of its own; focusable content inside it keeps its native behaviour."]
    : ["| Keys | Action |", "| --- | --- |", ...guidance.keyboard.map((row) => `| ${cell(row.keys)} | ${cell(row.action)} |`)];
  const props = component.props.length === 0
    ? ["No props of its own beyond the native element attributes it forwards."]
    : ["| Prop | Type | Required |", "| --- | --- | --- |", ...component.props.map((prop) => `| \`${cell(prop.name)}\` | \`${cell(prop.type)}\` | ${prop.required ? "yes" : "no"} |`)];
  return [
    `# ${component.name}`,
    "",
    `> ${guidance.purpose}`,
    "",
    `Family: ${component.family} · Root class: \`${component.className}\` · [Live page](${base}#/components/${component.name})`,
    "",
    "## Import",
    "",
    "```tsx",
    `import { ${component.name} } from "@conductor-by-89soone/react";`,
    "```",
    "",
    `## Props (\`${component.propsTypeName}\`)`,
    "",
    ...props,
    "",
    "## Use",
    "",
    ...guidance.use.map((line) => `- ${line}`),
    "",
    "## Avoid",
    "",
    ...guidance.avoid.map(({ rule, instead }) => `- ${rule}${instead === undefined ? "" : ` Instead: [${instead}](${instead}.md).`}`),
    "",
    "## Keyboard",
    "",
    ...keyboard,
    "",
    "## Accessibility",
    "",
    ...guidance.accessibility.map((line) => `- ${line}`),
    "",
  ].join("\n");
}

/** llmstxt.org: H1, a summary blockquote, then H2 sections of `- [name](url): note` links. */
export function renderLlmsTxt({ components, base, version }) {
  if (components.length === 0) throw new Error("error[DOC-AGENT]: llms.txt needs components");
  return [
    "# Conductor Design System",
    "",
    "> Dark-first design tokens, a framework-agnostic layered stylesheet and Radix-based React primitives for operational interfaces. Three npm packages: @conductor-by-89soone/tokens, @conductor-by-89soone/css and @conductor-by-89soone/react.",
    "",
    `Version ${version}. Import the stylesheet once, set \`data-cdt-theme\` on the root element, and style only through \`--cdt-*\` custom properties. Every page below is generated from the same sources as the human docs.`,
    "",
    "## Start here",
    "",
    `- [DESIGN.md](${base}DESIGN.md): token values per theme, principles and the component index`,
    `- [Tokens](${base}tokens.md): every token with its tier, both theme values and usage`,
    "",
    "## Components",
    "",
    ...components.map((component) => `- [${component.name}](${base}components/${component.name}.md): ${component.guidance.purpose}`),
    "",
    "## Optional",
    "",
    `- [Docs site](${base}): live previews, foundations and usage guidelines for people`,
    "",
  ].join("\n");
}
