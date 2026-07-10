/**
 * Token key → CSS custom property name, plus the two checks FR-TOK-004 attaches to it.
 *
 * Rule (tokens spec 3.1): drop `DEFAULT` segments, split camelCase into kebab-case,
 * replace `.` with `-`, prefix `--cdt-`, lowercase the result.
 *
 * Refs: WP-003 FR-TOK-004
 */
import { CDT_PREFIX } from "../constants";
import { DEFAULT_SEGMENT } from "../schema";
import type { TokenDefinition } from "../schema";
import { TokenBuildError } from "./errors";

/** `--cdt-`. Every emitted custom property starts with it (FR-TOK-004 AC-1). */
export const CUSTOM_PROPERTY_PREFIX = `--${CDT_PREFIX}` as const;

function kebab(segment: string): string {
  return segment.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * `surface.raised` → `--cdt-surface-raised` (AC-2).
 * `accent.DEFAULT` → `--cdt-accent`, so a key can be both a leaf and a parent path.
 */
export function cssPropertyName(key: string): string {
  const segments = key
    .split(".")
    .filter((segment) => segment !== DEFAULT_SEGMENT)
    .map(kebab);
  return `${CUSTOM_PROPERTY_PREFIX}${segments.join("-")}`;
}

/**
 * FR-TOK-004 exception handling: two keys must never collapse onto one custom property.
 * `text.monoPayload` and `text.mono.payload` would both yield `--cdt-text-mono-payload`.
 */
export function assertNoNameCollisions(tokens: readonly TokenDefinition[]): void {
  const byName = new Map<string, string[]>();
  for (const token of tokens) {
    const name = cssPropertyName(token.key);
    const keys = byName.get(name);
    if (keys) keys.push(token.key);
    else byName.set(name, [token.key]);
  }

  const collisions = [...byName.entries()].filter(([, keys]) => keys.length > 1);
  if (collisions.length === 0) return;

  throw new TokenBuildError(
    "TOK-NAME-COLLISION",
    `${collisions.length} CSS custom property name(s) claimed by more than one token key`,
    [
      ...collisions.map(([name, keys]) => `${name} <- ${keys.join(", ")}`),
      "hint: rename one of the keys; the dot-to-kebab mapping is not injective.",
    ],
  );
}

/** FR-TOK-004 AC-3: a declaration without the prefix fails the build. */
export function assertPrefixed(propertyNames: readonly string[]): void {
  const unprefixed = propertyNames.filter((name) => !name.startsWith(CUSTOM_PROPERTY_PREFIX));
  if (unprefixed.length === 0) return;

  throw new TokenBuildError(
    "TOK-PREFIX",
    `${unprefixed.length} custom property declaration(s) missing the \`${CUSTOM_PROPERTY_PREFIX}\` prefix`,
    [...unprefixed, `hint: every Conductor custom property is namespaced \`${CUSTOM_PROPERTY_PREFIX}\`.`],
  );
}

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** `tokens.surface.raised` needs no quotes; `tokens.surface["2"]` does. */
export function isSafeIdentifier(segment: string): boolean {
  return IDENTIFIER_PATTERN.test(segment);
}
