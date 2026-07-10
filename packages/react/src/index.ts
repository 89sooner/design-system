import { CDT_PREFIX, PACKAGE_NAME as TOKENS_PACKAGE_NAME } from "@conductor/tokens";

export { cx } from "./cx";
export type { IconSlot, PolymorphicProps, Size, Tone } from "./types";
export { Button, IconButton } from "./action";
export type { ButtonProps, IconButtonProps } from "./action";
export { Card, CardGrid, Panel } from "./surface";
export type { CardGridProps, CardProps, PanelProps } from "./surface";

/** Published name of this package. */
export const PACKAGE_NAME = "@conductor/react" as const;

/**
 * Internal packages this entry point resolves through their published entry
 * points rather than through source paths (FR-DX-001 AC-4). `@conductor/css` is
 * a stylesheet the consumer imports itself; it is listed here because
 * `@conductor/react` depends on its class names.
 */
export const CONSUMED_PACKAGES = [TOKENS_PACKAGE_NAME, "@conductor/css"] as const;

/** Builds a Conductor block class name, e.g. `cdt-btn` (ADR-006, FR-CSS-004 AC-2). */
export function blockClassName(block: string): string {
  return `${CDT_PREFIX}${block}`;
}
