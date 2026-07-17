/**
 * Namespace prefix owned by Conductor (ADR-006).
 *
 * CSS custom properties are emitted as `--cdt-<key>` and class selectors as
 * `cdt-<block>`. Downstream packages read this constant instead of hard-coding
 * the string so that a rename stays a one-line change.
 */
export const CDT_PREFIX = "cdt-" as const;

/** Published name of this package. */
export const PACKAGE_NAME = "@conductor-by-89soone/tokens" as const;
