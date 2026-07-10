import { describe, expect, test } from "vitest";
import { buildTokenIndex, resolveTokens } from "./build/reference";
import { darkPalette } from "./palette.dark";
import { primitiveTokens } from "./primitives";
import { canonicalTokens } from "./token-source";

/**
 * Every custom property of the `:root` block in
 * `agent-ai-platform/packages/web/src/styles/tokens.css`, transcribed verbatim, mapped to the
 * Conductor token key that must reproduce it. This table *is* FR-THM-001 AC-1.
 */
const SOURCE_ROOT: readonly (readonly [property: string, value: string, key: string])[] = [
  ["--surface-base", "#080b12", "surface.base"],
  ["--surface-canvas", "#0b101a", "surface.canvas"],
  ["--surface-subtle", "#101722", "surface.subtle"],
  ["--surface-2", "var(--surface-subtle)", "surface.2"],
  ["--surface-raised", "#141d2a", "surface.raised"],
  ["--surface-elevated", "#192535", "surface.elevated"],
  ["--surface-overlay", "rgba(4, 7, 12, 0.78)", "surface.overlay"],
  ["--surface-glass", "rgba(16, 23, 34, 0.82)", "surface.glass"],
  ["--surface-timeline", "#0d141f", "surface.timeline"],
  ["--text-primary", "#f4f7fb", "text.primary"],
  ["--text-secondary", "#c5cfdd", "text.secondary"],
  ["--text-muted", "#8290a3", "text.muted"],
  ["--text-faint", "#5f6d80", "text.faint"],
  ["--text-inverse", "#07111f", "text.inverse"],
  ["--text-mono-payload", "#dce6f3", "text.monoPayload"],
  ["--border-subtle", "rgba(148, 163, 184, 0.1)", "border.subtle"],
  ["--border-default", "rgba(148, 163, 184, 0.18)", "border.default"],
  ["--border-strong", "rgba(148, 163, 184, 0.3)", "border.strong"],
  ["--border", "var(--border-default)", "border.DEFAULT"],
  ["--accent", "#6d7cff", "accent.DEFAULT"],
  ["--accent-strong", "#5667f5", "accent.strong"],
  ["--accent-soft", "rgba(109, 124, 255, 0.14)", "accent.soft"],
  ["--accent-glow", "rgba(109, 124, 255, 0.28)", "accent.glow"],
  ["--status-queued", "#64748b", "status.queued"],
  ["--status-running", "#6d7cff", "status.running"],
  ["--status-waiting", "#f59e0b", "status.waiting"],
  ["--status-success", "#10b981", "status.success"],
  ["--status-partial", "#eab308", "status.partial"],
  ["--status-danger", "#ef4444", "status.danger"],
  ["--status-neutral-end", "#475569", "status.neutralEnd"],
  ["--meter-normal", "#34d399", "meter.normal"],
  ["--meter-warning", "#fbbf24", "meter.warning"],
  ["--meter-exceeded", "#f87171", "meter.exceeded"],
  ["--severity-read", "#15803d", "severity.read"],
  ["--severity-write", "#c2410c", "severity.write"],
  ["--severity-destructive", "#b91c1c", "severity.destructive"],
  ["--severity-blocked", "#7f1d1d", "severity.blocked"],
  [
    "--type-sans",
    'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "font.sans",
  ],
  [
    "--type-mono",
    '\'JetBrains Mono\', ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    "font.mono",
  ],
  ["--space-1", "4px", "space.1"],
  ["--space-2", "8px", "space.2"],
  ["--space-3", "12px", "space.3"],
  ["--space-4", "16px", "space.4"],
  ["--space-5", "24px", "space.5"],
  ["--space-6", "32px", "space.6"],
  ["--space-7", "40px", "space.7"],
  ["--space-8", "48px", "space.8"],
  ["--radius-xs", "6px", "radius.xs"],
  ["--radius-sm", "9px", "radius.sm"],
  ["--radius-md", "12px", "radius.md"],
  ["--radius-lg", "18px", "radius.lg"],
  ["--radius-xl", "24px", "radius.xl"],
  ["--elevation-raised", "0 12px 30px rgba(0, 0, 0, 0.18)", "elevation.raised"],
  ["--elevation-hover", "0 18px 46px rgba(0, 0, 0, 0.26)", "elevation.hover"],
  [
    "--elevation-overlay",
    "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border-strong)",
    "elevation.overlay",
  ],
  ["--focus-ring", "0 0 0 3px rgba(109, 124, 255, 0.3)", "focusRing"],
  ["--state-hover", "rgba(255, 255, 255, 0.055)", "state.hover"],
  ["--state-selected", "rgba(109, 124, 255, 0.16)", "state.selected"],
  ["--state-disabled", "#18202c", "state.disabled"],
  ["--state-disabled-policy", "#422006", "state.disabledPolicy"],
  ["--motion-fast", "140ms cubic-bezier(0.2, 0, 0, 1)", "motion.fast"],
  ["--motion-standard", "240ms cubic-bezier(0.2, 0, 0, 1)", "motion.standard"],
  ["--motion-bounce", "300ms cubic-bezier(0.34, 1.56, 0.64, 1)", "motion.bounce"],
];

/** FR-THM-001 AC-1 exempts these two: FR-THM-001 AC-2 requires them to stay references. */
const SOURCE_ALIASES = ["--surface-2", "--border"];

/** FR-THM-005 / `srs_final.md` 12.1. The only two dark values that are not inherited verbatim. */
const CORRECTED: Readonly<Record<string, string>> = {
  "--focus-ring": "0 0 0 3px rgba(109, 124, 255, 0.8)",
};

/** The source wrote a `var()`; the token build resolves it to a literal (FR-TOK-003 AC-1). */
const RESOLVED_IN_PLACE: Readonly<Record<string, string>> = {
  "--elevation-overlay": "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.3)",
};

const tokens = canonicalTokens();
const byKey = new Map(tokens.map((token) => [token.key, token]));
const resolved = resolveTokens(buildTokenIndex(tokens)).values;

describe("dark palette against the source tokens.css", () => {
  test.each(SOURCE_ROOT.filter(([property]) => !SOURCE_ALIASES.includes(property)))(
    "FR-THM-001 AC-1: source `%s` is reproduced 1:1 by token `%s`",
    (property, sourceValue, key) => {
      expect(byKey.has(key)).toBe(true);
      const expected = CORRECTED[property] ?? RESOLVED_IN_PLACE[property] ?? sourceValue;
      expect(resolved.get(key)).toBe(expected);
    },
  );

  test("FR-THM-001 AC-2: `--surface-2` and `--border` are expressed as token references", () => {
    expect(byKey.get("surface.2")?.alias).toBe("surface.subtle");
    expect(byKey.get("surface.2")?.value).toBeUndefined();
    expect(byKey.get("border.DEFAULT")?.alias).toBe("border.default");
    expect(byKey.get("border.DEFAULT")?.value).toBeUndefined();
  });

  test("FR-THM-001 AC-1: the semantic key set is the source key set plus the documented additions", () => {
    const semanticKeys = new Set(
      tokens.filter((token) => token.tier === "semantic").map((token) => token.key),
    );
    const sourceKeys = new Set(SOURCE_ROOT.map(([, , key]) => key));

    for (const key of sourceKeys) expect(semanticKeys.has(key)).toBe(true);

    const added = [...semanticKeys].filter((key) => !sourceKeys.has(key)).sort();
    expect(added).toEqual(
      [
        // FR-THM-005 AC-2: the one new colour token.
        "border.control",
        // FR-TOK-007, FR-TOK-008, FR-TOK-009: scales the source expressed as literals.
        ...["2xs", "xs", "sm", "base", "md", "lg", "xl"].map((step) => `font.lineHeight.${step}`),
        ...["2xs", "xs", "sm", "base", "md", "lg", "xl"].map((step) => `font.size.${step}`),
        ...["sm", "md", "lg"].map((name) => `breakpoint.${name}`),
        ...["base", "raised", "sticky", "drawer", "overlay", "popover"].map((layer) => `z.${layer}`),
      ].sort(),
    );
  });

  test("FR-THM-005 AC-1: `focusRing` uses the accent at alpha 0.80, not the source's 0.30", () => {
    expect(resolved.get("focusRing")).toBe("0 0 0 3px rgba(109, 124, 255, 0.8)");
    expect(byKey.get("focusRing")?.usage).toBe("nonText");
  });

  test("FR-THM-005 AC-2: `border.control` exists at slate alpha 0.60 and is checked as non-text", () => {
    expect(resolved.get("border.control")).toBe("rgba(148, 163, 184, 0.6)");
    expect(byKey.get("border.control")?.usage).toBe("nonText");
  });

  test("FR-THM-005 AC-3: `text.faint` is decorative", () => {
    expect(byKey.get("text.faint")?.usage).toBe("decorative");
  });

  test("FR-THM-005 AC-4: `border.subtle`, `border.default` and `border.strong` are decorative", () => {
    for (const key of ["border.subtle", "border.default", "border.strong"]) {
      expect(byKey.get(key)?.usage).toBe("decorative");
    }
  });

  test("FR-THM-005 AC-5: `status.queued` is non-text", () => {
    expect(byKey.get("status.queued")?.usage).toBe("nonText");
  });

  test("FR-THM-005 AC-6: `status.neutralEnd` is decorative (CR-006)", () => {
    expect(byKey.get("status.neutralEnd")?.usage).toBe("decorative");
  });

  test("FR-THM-004 exception handling: every decorative token records why it is excluded", () => {
    const decorative = tokens
      .filter((token) => token.tier !== "primitive" && token.usage === "decorative")
      .filter((token) => token.description.trim() === "");

    expect(decorative).toEqual([]);
  });
});

describe("status, severity and meter token families", () => {
  const keysIn = (group: string): string[] =>
    darkPalette.filter((token) => token.key.startsWith(`${group}.`)).map((token) => token.key);

  test("FR-TOK-005 AC-1: the seven run-state keys exist", () => {
    expect(keysIn("status")).toEqual([
      "status.queued",
      "status.running",
      "status.waiting",
      "status.success",
      "status.partial",
      "status.danger",
      "status.neutralEnd",
    ]);
  });

  test("FR-TOK-005 AC-2: the four severity keys exist", () => {
    expect(keysIn("severity")).toEqual([
      "severity.read",
      "severity.write",
      "severity.destructive",
      "severity.blocked",
    ]);
  });

  test("FR-TOK-005 AC-3: the three meter keys exist", () => {
    expect(keysIn("meter")).toEqual(["meter.normal", "meter.warning", "meter.exceeded"]);
  });

  test("FR-TOK-005 AC-5: every status and severity token carries a non-empty `icon`", () => {
    for (const key of [...keysIn("status"), ...keysIn("severity")]) {
      expect(byKey.get(key)?.icon).toBeTruthy();
    }
  });

  test("FR-TOK-005 AC-5: meter tokens carry no icon; the SRS scopes `icon` to status and severity", () => {
    for (const key of keysIn("meter")) expect(byKey.get(key)?.icon).toBeUndefined();
  });
});

describe("primitive tokens stay private", () => {
  test("FR-TOK-002 AC-5: the public entry point exports no primitive token", async () => {
    const entry: Record<string, unknown> = await import("./index");

    expect(Object.keys(entry).sort()).toEqual([
      "CDT_PREFIX",
      "PACKAGE_NAME",
      "breakpoints",
      "tokens",
    ]);
    // Not the bare string "ink": `--cdt-table-link-text` legitimately contains it.
    expect(JSON.stringify(entry.tokens)).not.toContain("--cdt-ink-");
  });

  test("FR-TOK-002 AC-1: no primitive token references another token", () => {
    for (const token of primitiveTokens) {
      expect(token.alias).toBeUndefined();
      expect(String(token.value)).not.toMatch(/\{[^{}]+\}/);
    }
  });
});
