export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "conductor-theme";

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
