import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

/** Read a file that only exists after `pnpm --filter @conductor/css build`. */
export const readBuilt = (relativePath: string): string => {
  const path = fileURLToPath(new URL(relativePath, import.meta.url));
  if (!existsSync(path)) {
    throw new Error(
      `${relativePath} is missing. Run \`pnpm --filter @conductor/css build\` first ` +
        `(CI runs build before test — see CR-009).`,
    );
  }
  return readFileSync(path, "utf8");
};

export const readSource = (relativePath: string): string =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

export interface FlatRule {
  selector: string;
  decls: Record<string, string>;
  /** `@media` preludes wrapping the rule, outermost first. */
  media: string[];
}

/**
 * Every rule declared inside `@layer <layerName> { … }`, flattened. Reading the
 * built artifact through an AST keeps the assertions independent of how
 * lightningcss chooses to minify selectors and shorthands.
 */
export const rulesInLayer = (css: string, layerName: string): FlatRule[] => {
  const found: FlatRule[] = [];

  postcss.parse(css).walkAtRules("layer", (layer) => {
    if (!layer.nodes || layer.params !== layerName) return;

    layer.walkRules((rule) => {
      const media: string[] = [];
      let parent: postcss.Node | undefined = rule.parent;
      while (parent) {
        if (parent.type === "atrule" && (parent as postcss.AtRule).name === "media") {
          media.unshift((parent as postcss.AtRule).params);
        }
        parent = parent.parent;
      }

      const decls: Record<string, string> = {};
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });

      found.push({ selector: rule.selector, decls, media });
    });
  });

  return found;
};

/** Rules of a layer that sit outside any `@media`. */
export const topLevelRules = (css: string, layerName: string): FlatRule[] =>
  rulesInLayer(css, layerName).filter((rule) => rule.media.length === 0);

/** Rules of a layer nested under a `@media` whose prelude matches `pattern`. */
export const mediaRules = (css: string, layerName: string, pattern: RegExp): FlatRule[] =>
  rulesInLayer(css, layerName).filter((rule) => rule.media.some((query) => pattern.test(query)));

/** True when the bundle contains a `@layer <name> { … }` block. */
export const hasLayerBlock = (css: string, layerName: string): boolean => {
  let present = false;
  postcss.parse(css).walkAtRules("layer", (layer) => {
    if (layer.nodes && layer.params === layerName) present = true;
  });
  return present;
};
