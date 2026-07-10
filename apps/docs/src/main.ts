import { blockClassName, PACKAGE_NAME as REACT_PACKAGE_NAME } from "@conductor/react";
import { PACKAGE_NAME as TOKENS_PACKAGE_NAME } from "@conductor/tokens";

/**
 * The docs site is Conductor's first consumer: it installs the packages through
 * `workspace:*` and imports them by their published names, never by source path
 * (FR-DOC-001 AC-1, FR-DX-001 AC-4).
 */
export const INSTALLED_PACKAGES = [
  TOKENS_PACKAGE_NAME,
  "@conductor/css",
  REACT_PACKAGE_NAME,
] as const;

/** Class applied to the docs site shell once WP-018 lands. */
export const SHELL_CLASS_NAME = blockClassName("app-shell");
