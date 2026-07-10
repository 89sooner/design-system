/**
 * Public entry point of `@conductor/tokens` (API-PKG-001, API-TOK-002).
 *
 * Semantic and component tokens only. `primitives.ts` is deliberately absent: a consumer has no
 * path to `ink.900` (FR-TOK-002 AC-5), and the build never gives it a `--cdt-` name
 * (FR-TOK-004 AC-4).
 */
export { CDT_PREFIX, PACKAGE_NAME } from "./constants";
export { tokens } from "./tokens";
export type { Tokens } from "./tokens";
export { breakpoints } from "./breakpoints";
export type { Breakpoints } from "./breakpoints";
export type { TokenDefinition, TokenGroup, TokenTier, TokenUsage } from "./schema";
