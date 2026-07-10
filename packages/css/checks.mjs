// Static checks on the built stylesheet. postcss is used as a parser only, never
// as a build transform (ADR-008). Refs: WP-008 FR-CSS-001 FR-CSS-002
import postcss from "postcss";

/** The five layers, in cascade order. Nothing may declare a rule outside them. */
export const LAYER_NAMES = Object.freeze([
  "cdt.reset",
  "cdt.base",
  "cdt.layout",
  "cdt.component",
  "cdt.utility",
]);

const REMOTE_URL = /url\(\s*['"]?(?:https?:)?\/\//i;

const at = (node) => {
  const start = node.source?.start;
  return { line: start?.line ?? 0, column: start?.column ?? 0 };
};

/** Walk up from `node`; true when some ancestor is an `@layer { … }` block. */
const isInsideLayerBlock = (node) => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && parent.name === "layer" && parent.nodes) return true;
  }
  return false;
};

/**
 * Inspect one built bundle. Returns every violation found; an empty array means
 * the bundle satisfies FR-CSS-001 AC-1/AC-2, FR-CSS-002 AC-4, and the
 * `--cdt-`-only custom-property rule of JOB-BUILD-002.
 */
export function inspectBundle(css, filename = "<bundle>") {
  const violations = [];
  const report = (code, node, message, hint) =>
    violations.push({ code, filename, ...at(node), message, hint });

  const root = postcss.parse(css, { from: filename });

  root.walkAtRules((rule) => {
    if (rule.name === "layer") {
      for (const name of rule.params.split(",").map((part) => part.trim()).filter(Boolean)) {
        if (!LAYER_NAMES.includes(name)) {
          report(
            "CSS-UNKNOWN-LAYER",
            rule,
            `unknown cascade layer \`${name}\``,
            `layers are fixed to: ${LAYER_NAMES.join(", ")}`,
          );
        }
      }
    }

    if (rule.name === "import") {
      report(
        "CSS-REMOTE-FONT",
        rule,
        `\`@import\` survived bundling: \`@import ${rule.params}\``,
        "every @import must be inlined at build time; a shipped @import is a runtime network request (NFR-002)",
      );
    }

    if (rule.name === "media" && /var\(\s*--cdt-breakpoint-/.test(rule.params)) {
      report(
        "CSS-MEDIA-VAR",
        rule,
        `media query references a breakpoint custom property: \`${rule.params}\``,
        "custom properties do not evaluate in media conditions; substitute the token with a literal",
      );
    }
  });

  root.walkRules((rule) => {
    if (!isInsideLayerBlock(rule)) {
      report(
        "CSS-UNLAYERED",
        rule,
        `rule \`${rule.selector}\` is not inside a cascade layer`,
        "an unlayered Conductor rule outranks a consumer's unlayered rule and breaks FR-CSS-001 AC-3",
      );
    }
  });

  root.walkDecls((decl) => {
    if (decl.important) {
      report(
        "CSS-IMPORTANT",
        decl,
        `\`!important\` on \`${decl.prop}\``,
        "the cascade is controlled by @layer; !important is banned (ADR-005, FR-CSS-001 AC-2)",
      );
    }

    if (decl.prop.startsWith("--") && !decl.prop.startsWith("--cdt-")) {
      report(
        "CSS-CUSTOM-PROPERTY",
        decl,
        `custom property \`${decl.prop}\` is not \`--cdt-\` prefixed`,
        "an unprefixed custom property collides with consumer variables (R-5)",
      );
    }

    if (REMOTE_URL.test(decl.value)) {
      report(
        "CSS-REMOTE-FONT",
        decl,
        `remote url in \`${decl.prop}\``,
        "the deployed artifact makes zero runtime network requests (NFR-002, FR-CSS-002 AC-4)",
      );
    }
  });

  return violations;
}

/** Format violations the way the token build formats its own errors. */
export function formatViolations(violations) {
  const lines = [];
  for (const v of violations) {
    lines.push(`error[${v.code}]: ${v.message}`);
    lines.push(`  ${v.filename}:${v.line}:${v.column}`);
    if (v.hint) lines.push(`  hint: ${v.hint}`);
  }
  lines.push(`[css] ${violations.length} violation(s)`);
  return lines.join("\n");
}
