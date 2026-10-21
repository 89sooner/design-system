// Turns the built `@conductor-by-89soone/css` stylesheets into the artifact's `components/bundle.css`.
//
// One source for every value: a `--cdt-*` declaration whose token now lives in the artifact's
// tokens.json is removed, so an edit made on the artifact page wins. What tokens.json cannot hold
// (motion, gradients, font stacks …) stays declared here.
//
// The artifact's preview frame selects a theme with `data-theme`, so `data-cdt-theme` is renamed.

const DECLARATION = /(--cdt-[\w-]+):([^;{}]*)(;|(?=\}))/g;

export const HEADER =
  "/* Conductor — @conductor-by-89soone/css dist/index.css + dist/agent.css. Token values come from tokens.json; theme attribute is data-theme here (data-cdt-theme in the npm package). */\n";

/** @param {Iterable<string>} declared `--cdt-*` names owned by tokens.json */
export const withoutDeclarations = (css, declared) => {
  const owned = new Set(declared);
  return css.replace(DECLARATION, (whole, name) => (owned.has(name) ? "" : whole)).replace(/\{;+/g, "{");
};

export const withArtifactThemeAttribute = (css) => css.replaceAll("data-cdt-theme", "data-theme");

/** A stylesheet the artifact inlines must not be able to close its own `<style>` element. */
export function assertInlineSafe(css) {
  if (/<\/style/i.test(css)) throw new Error("bundle.css contains </style and cannot be inlined");
  return css;
}

export const toBundleCss = (stylesheets, declared) =>
  HEADER + assertInlineSafe(withArtifactThemeAttribute(withoutDeclarations(stylesheets.join("\n"), declared)));

/** `--cdt-*` names still declared in a stylesheet. */
export const declaredNames = (css) => [...new Set([...css.matchAll(DECLARATION)].map((match) => match[1]))];
