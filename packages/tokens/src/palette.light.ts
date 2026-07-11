/**
 * Light palette derived mechanically from tokens spec section 6 (FR-THM-002).
 *
 * Metadata, keys and aliases come from the canonical dark palette. This map changes only values
 * that the derivation specifies differently, keeping the two semantic key sets inseparable.
 */
import { darkPalette } from "./palette.dark";
import type { TokenDefinition } from "./schema";

const values: Readonly<Record<string, string>> = {
  "surface.base": "#e8ecf2",
  "surface.canvas": "#eef1f6",
  "surface.subtle": "#f3f6f9",
  "surface.raised": "#fbfcfd",
  "surface.elevated": "#ffffff",
  "surface.overlay": "rgba(12, 18, 28, 0.45)",
  "surface.glass": "rgba(251, 252, 253, 0.86)",
  "surface.timeline": "#f1f4f8",
  "surface.track": "rgba(12, 18, 28, 0.08)",
  "text.primary": "#0c121c",
  "text.secondary": "#33415a",
  "text.muted": "#4d5a6e",
  "text.faint": "#6b788c",
  "text.inverse": "#f4f7fb",
  "text.monoPayload": "#1b2537",
  "border.subtle": "#e2e8f0",
  "border.default": "#6b788c",
  "border.strong": "#5b6879",
  "border.control": "#64748b",
  "accent.DEFAULT": "#4f5bd5",
  "accent.strong": "#3f4ac0",
  "accent.soft": "rgba(79, 91, 213, 0.14)",
  "accent.glow": "rgba(79, 91, 213, 0.22)",
  "status.queued": "#52607a",
  "status.waiting": "#b45309",
  "status.success": "#047857",
  "status.partial": "#a16207",
  "status.danger": "#c81e1e",
  "status.neutralEnd": "#3f4b5f",
  "meter.normal": "#047857",
  "meter.warning": "#b45309",
  "meter.exceeded": "#dc2626",
  "elevation.raised": "0 12px 30px rgba(12, 18, 28, 0.08)",
  "elevation.hover": "0 18px 46px rgba(12, 18, 28, 0.12)",
  "elevation.overlay": "0 24px 64px rgba(12, 18, 28, 0.2), 0 0 0 1px {border.strong}",
  "focusRing": "0 0 0 3px rgba(79, 91, 213, 0.8)",
  "state.hover": "rgba(12, 18, 28, 0.05)",
  "state.selected": "rgba(79, 91, 213, 0.12)",
  "state.disabled": "#e2e8f0",
  "state.disabledPolicy": "#fef3c7",
};

export const lightPalette: readonly TokenDefinition[] = darkPalette.map((token) => {
  const value = values[token.key];
  return value === undefined ? token : { ...token, value, alias: undefined };
});
