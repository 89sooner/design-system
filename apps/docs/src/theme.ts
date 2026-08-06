export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "conductor-theme";

/**
 * The theme the prerendered landing markup is drawn with (`scripts/prerender.mjs` shims
 * `matchMedia` to dark). A hydrating client must start from the same value or the first render
 * disagrees with the served HTML and React throws the prerender away — which is the whole point of
 * having one. Every other entry path reads the real preference up front instead (`main.tsx`).
 */
export const PRERENDER_THEME: Theme = "dark";

export function preferredTheme(windowLike: Pick<Window, "matchMedia">): Theme {
  return windowLike.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readTheme(windowLike: Pick<Window, "localStorage" | "matchMedia">): Theme {
  try {
    const saved = windowLike.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Privacy modes can reject localStorage; the preference remains usable.
  }
  return preferredTheme(windowLike);
}

export function applyTheme(theme: Theme, documentLike: Pick<Document, "documentElement">): void {
  documentLike.documentElement.dataset.cdtTheme = theme;
}

export function persistTheme(theme: Theme, windowLike: Pick<Window, "localStorage">): void {
  try {
    windowLike.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A failed persistence write must never block rendering (FR-DOC-005).
  }
}
