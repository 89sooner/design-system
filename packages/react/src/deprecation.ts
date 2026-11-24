// FR-DX-006 AC-3 · CR-082: a public API on its way out stays for at least one minor with an `@deprecated`
// JSDoc tag and this one-time warning in development builds, then goes in the next major.
// Module-internal: not exported from `index.ts`. Until something is deprecated nothing imports it, so the
// published bundle does not contain it.

const warned = new Set<string>();

/**
 * Call where a deprecated API is used: in a deprecated component's render, when a deprecated prop is
 * passed, in a deprecated function's body. `api` names it as a consumer writes it (`Button prop "tone"`)
 * and `replacement` says what to use instead. Warns once per `api` per page, or per server process
 * during SSR. Production builds skip it.
 */
export function warnDeprecated(api: string, replacement: string): void {
  if (process.env.NODE_ENV === "production" || warned.has(api)) return;
  warned.add(api);
  console.warn(`[conductor] ${api} is deprecated and will be removed in the next major version. ${replacement}`);
}

/** Test seam: forget which APIs already warned. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
