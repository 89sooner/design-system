// Converts the built `@conductor-by-89soone/tokens` artifact (`dist/tokens.json`) into the token
// file a Claude Design System artifact reads (`project/tokens.json`): flat `{tokens: [...]}` lists
// per family, colours and shadows per theme, everything else a single value.
//
// Every function here is pure; `build.mjs` does the reading and writing.

const COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\)|hsla?\([\d.,\s%]+\))$/;
const BOX_SHADOW = /^(inset )?-?\d/;
/** Plain CSS values the artifact accepts in a non-colour family. */
const PLAIN_VALUE = /^[A-Za-z0-9 #%(),./+_-]{1,200}$/;
/** Font stacks: shown through `type.families`, but the components read `--cdt-font-*`, so they stay in the stylesheet. */
const FONT_STACK_KEYS = new Set(["font.sans", "font.mono", "table.numFontFamily"]);

export const THEMES = [
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
];

/** Families in the order the artifact shows them, after color, type and shadow. */
export const PLAIN_FAMILIES = ["spacing", "radius", "borderWidth", "zIndex", "breakpoint", "fontScale", "controls", "surfaces", "layout"];

export const nameOf = (token) => token.cssName.replace(/^--/, "");
const groupOf = (token) => token.key.split(".")[0];
const valueIn = (token, theme) => String(token.values[theme]);
const sameInEveryTheme = (token) => THEMES.every(({ id }) => valueIn(token, id) === valueIn(token, THEMES[0].id));

export const isColor = (token) => THEMES.every(({ id }) => COLOR.test(valueIn(token, id)));

export function isShadow(token) {
  const { key } = token;
  const named = key.startsWith("elevation.") || key === "focusRing" || /\.(shadow|shadowHover|focusRing)$/.test(key);
  return named && BOX_SHADOW.test(valueIn(token, THEMES[0].id));
}

/**
 * Tokens the artifact's tables cannot hold: motion and transitions (no motion family), gradients,
 * `transparent`, font stacks, and lengths that differ per theme. They stay declared in bundle.css.
 */
export function staysInStylesheet(token) {
  const value = valueIn(token, THEMES[0].id);
  return (
    !sameInEveryTheme(token) ||
    groupOf(token) === "motion" ||
    /\d+m?s /.test(value) ||
    value.includes("gradient") ||
    value === "transparent" ||
    FONT_STACK_KEYS.has(token.key) ||
    !PLAIN_VALUE.test(value)
  );
}

/** Which plain family a single-valued token belongs to. */
export function plainFamilyOf(token) {
  const group = groupOf(token);
  if (group === "space") return "spacing";
  if (group === "radius") return "radius";
  if (token.key.startsWith("border.width.")) return "borderWidth";
  if (group === "z" || /Z$/.test(token.key)) return "zIndex";
  if (group === "breakpoint" || token.key.endsWith("Breakpoint")) return "breakpoint";
  if (group === "font") return "fontScale";
  if (["button", "input", "badge", "table"].includes(group)) return "controls";
  if (group === "page") return "layout";
  return "surfaces";
}

/** `color` | `shadow` | a plain family | `stylesheet`. */
export function familyOf(token) {
  if (isColor(token)) return "color";
  if (isShadow(token)) return "shadow";
  if (staysInStylesheet(token)) return "stylesheet";
  return plainFamilyOf(token);
}

/** `Map.groupBy` without requiring Node 21 (the repository supports Node 20). */
export const groupBy = (items, keyOf) =>
  items.reduce((groups, item) => groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]), new Map());

const usageOf = (token) => token.description.trim().slice(0, 1000);
const normalizeColor = (value) => (value.startsWith("#") ? value.toLowerCase() : value);

/** A colour keeps its source alias in every theme where the alias still resolves to the same value. */
export function colorValue(token, byKey) {
  const target = token.alias === undefined ? undefined : byKey.get(token.alias);
  return Object.fromEntries(
    THEMES.map(({ id }) => {
      const value = valueIn(token, id);
      const aliased = target !== undefined && isColor(target) && valueIn(target, id) === value;
      return [id, aliased ? `{${nameOf(target)}}` : normalizeColor(value)];
    }),
  );
}

const perTheme = (token) => Object.fromEntries(THEMES.map(({ id }) => [id, valueIn(token, id)]));

function typeFamily(byKey) {
  const value = (key) => valueIn(byKey.get(key), THEMES[0].id);
  const step = (name, usage, extra = {}) => ({
    name: `font-${name}`,
    fontSize: value(`font.size.${name}`),
    lineHeight: value(`font.lineHeight.${name}`),
    fontWeight: 400,
    ...extra,
    usage,
  });
  return {
    families: { sans: value("font.sans"), mono: value("font.mono") },
    fonts: [],
    groups: [
      {
        name: "Page",
        family: "sans",
        styles: [
          { name: "page-heading", fontSize: "32px", lineHeight: value("page.headingLineHeight"), fontWeight: 700, letterSpacing: "-0.035em", usage: `\`h1\`. Fluid in code: \`--cdt-page-heading-size\` = ${value("page.headingSize")}; shown at its maximum.`, sample: "Release dashboard" },
          { name: "page-section-heading", fontSize: value("page.sectionHeadingSize"), lineHeight: value("page.sectionHeadingLineHeight"), fontWeight: 700, letterSpacing: "-0.018em", usage: "`h2` section headings.", sample: "Recent deployments" },
          { name: "page-sub-heading", fontSize: value("page.subHeadingSize"), lineHeight: value("page.subHeadingLineHeight"), fontWeight: 700, letterSpacing: "-0.018em", usage: "`h3` sub-headings.", sample: "Canary checks" },
          { name: "page-lead", fontSize: value("page.leadSize"), lineHeight: value("page.leadLineHeight"), fontWeight: 400, usage: "Lead paragraph under a page heading.", sample: "Every run, approval and tool call in one place." },
        ],
      },
      {
        name: "Scale",
        family: "sans",
        styles: [
          step("xl", "Largest scale step; card and dialog titles."),
          step("lg", "Card emphasis and lead values."),
          step("md", "Body copy — the `body` default (`--cdt-font-size-md`)."),
          step("base", "Table headers, field labels, dense body."),
          step("sm", "Badges, descriptions, secondary meta."),
          step("xs", "Uppercase eyebrows and section labels (700, tracked 0.08em).", { fontWeight: 700, letterSpacing: "0.08em" }),
          step("2xs", "Smallest step; counters and micro-labels."),
        ],
      },
      {
        name: "Mono",
        family: "mono",
        styles: [{ name: "mono-payload", fontSize: value("font.size.base"), lineHeight: value("font.lineHeight.base"), fontWeight: 400, usage: "Code, IDs and payloads in `text-mono-payload`; numeric table cells.", sample: "run_2026_10_21_0412" }],
      },
    ],
  };
}

/**
 * @param {{tokens: object[]}} source  `packages/tokens/dist/tokens.json`
 * @param {{ref: string, synced: string}} provenance
 * @returns {{tokens: object, stylesheetOnly: string[], declared: string[]}}
 *   `tokens` is the artifact's tokens.json; `declared` are the `--cdt-*` names it now owns,
 *   `stylesheetOnly` the ones bundle.css keeps declaring.
 */
export function toArtifactTokens(source, provenance) {
  const byKey = new Map(source.tokens.map((token) => [token.key, token]));
  const families = groupBy(source.tokens, familyOf);
  const entries = (family, value) => (families.get(family) ?? []).map((token) => ({ name: nameOf(token), value: value(token), usage: usageOf(token) }));

  const tokens = {
    name: "Conductor",
    version: 1,
    color: { themes: THEMES, tokens: entries("color", (token) => colorValue(token, byKey)) },
    type: typeFamily(byKey),
    shadow: { tokens: entries("shadow", perTheme) },
    ...Object.fromEntries(PLAIN_FAMILIES.map((family) => [family, { tokens: entries(family, (token) => valueIn(token, THEMES[0].id)) }])),
    meta: {
      source: "github",
      repo: "89sooner/design-system",
      ref: provenance.ref,
      package: "packages/tokens",
      paths: {
        tokens: ["packages/tokens/src/primitives.ts", "packages/tokens/src/palette.dark.ts", "packages/tokens/src/palette.light.ts", "packages/tokens/src/scales.ts", "packages/tokens/src/components.ts"],
        css: ["packages/css/src"],
        docs: ["README.md", "apps/docs/src/content/component-guidance.json", "docs/20_derived_ui_specs/conductor_design_system_tokens.md"],
        assets: ["apps/docs/index.html (favicon)", "apps/docs/src/shell.tsx (BrandMark)"],
      },
      components: { "*": "packages/react/src/index.ts" },
      synced: provenance.synced,
    },
  };

  const stylesheetOnly = (families.get("stylesheet") ?? []).map((token) => token.cssName);
  const declared = source.tokens.filter((token) => familyOf(token) !== "stylesheet").map((token) => token.cssName);
  return { tokens, stylesheetOnly, declared };
}

/** Names must be unique across every family but `type`; a duplicate would be dropped by the page. */
export function duplicateNames(tokens) {
  const names = Object.entries(tokens)
    .filter(([, family]) => family !== null && typeof family === "object" && Array.isArray(family.tokens))
    .flatMap(([, family]) => family.tokens.map((token) => token.name));
  return names.filter((name, index) => names.indexOf(name) !== index);
}
