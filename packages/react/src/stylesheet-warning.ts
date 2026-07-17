const STYLE_MARKER = "--cdt-font-sans";

let warningScheduled = false;

/**
 * Warn once when a consumer renders a Conductor class without loading the CSS
 * package. The deferred check gives bundlers time to apply extracted styles and
 * never runs during SSR.
 */
export function scheduleStylesheetWarning(): void {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined" || warningScheduled) return;
  warningScheduled = true;

  window.setTimeout(() => {
    const marker = window.getComputedStyle(document.documentElement).getPropertyValue(STYLE_MARKER).trim();
    if (marker === "") {
      console.warn('[conductor] Components are unstyled. Import "@conductor-by-89soone/css" once in your application entry point.');
    }
  }, 0);
}
