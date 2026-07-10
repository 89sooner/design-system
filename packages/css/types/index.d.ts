/**
 * `@conductor/css` is consumed as a side-effect stylesheet import:
 *
 * ```ts
 * import "@conductor/css";
 * ```
 *
 * The package ships no JavaScript. This declaration is what `exports["."].types`
 * resolves to, so consumers typecheck the import without declaring a `*.css`
 * module shim of their own (FR-DX-002 AC-1, FR-DX-002 AC-3).
 */
export {};
