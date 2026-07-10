import { describe, expect, test } from "vitest";
import { TokenBuildError } from "../build/errors";
import { CONTRAST_THRESHOLDS, contrastPairs } from "../contrast-pairs";
import type { ContrastPair, ContrastUsage } from "../contrast-pairs";
import { darkPalette } from "../palette.dark";
import type { TokenDefinition } from "../schema";
import { THEME_SOURCES } from "../token-source";
import type { ThemeSource } from "../token-source";
import { parseContrastArgs, selectThemes } from "./args";
import { checkContrast } from "./check";
import type { ContrastReport, PairResult } from "./check";
import { exitCodeFor, formatExclusions, formatResult, formatSummary, renderReportJson } from "./report";

const DARK = THEME_SOURCES[0] as ThemeSource;

/** The dark theme with a few palette values replaced, so a pair can be driven below threshold. */
function themeWith(overrides: Readonly<Record<string, string>>): ThemeSource {
  const palette = darkPalette.map((token): TokenDefinition => {
    const replacement = overrides[token.key];
    return replacement === undefined ? token : { ...token, value: replacement };
  });
  return { ...DARK, palette };
}

function pairOf(id: string, foreground: string, background: string, usage: ContrastUsage = "body"): ContrastPair {
  return { id, foreground, background, usage, themes: ["dark"] };
}

function resultOf(report: ContrastReport, id: string): PairResult {
  const result = report.results.find((entry) => entry.id === id);
  if (result === undefined) throw new Error(`no result for ${id}`);
  return result;
}

/** The error a call throws, so a test asserts on its code and exit code rather than a substring. */
function thrownBy(run: () => unknown): TokenBuildError {
  try {
    run();
  } catch (error) {
    if (error instanceof TokenBuildError) return error;
    throw error;
  }
  throw new Error("expected the call to throw a TokenBuildError");
}

describe("FR-THM-004: the dark theme's measured contrast", () => {
  const report = checkContrast();
  const ratioOf = (id: string): string => resultOf(report, id).ratio.toFixed(2);

  test("FR-THM-004 AC-1: every declared pair is measured once per theme it names", () => {
    expect(report.summary.declaredPairs).toBe(contrastPairs.length);
    expect(report.summary.checks).toBe(contrastPairs.length * 2);
    expect(report.themes).toEqual(["dark", "light"]);
  });

  test("FR-A11Y-004 AC-1: the dark theme reports zero contrast failures", () => {
    expect(report.results.filter((result) => !result.pass)).toEqual([]);
    expect(report.summary.failed).toBe(0);
    expect(exitCodeFor(report)).toBe(0);
    expect(formatSummary(report)).toBe(`0 of ${contrastPairs.length * 2} pairs checked failed contrast threshold`);
  });

  test("FR-THM-004 AC-4: text and accent pairs reproduce the tokens spec 8.2 table", () => {
    expect(ratioOf("CP-001")).toBe("18.32"); // text.primary / surface.base
    expect(ratioOf("CP-006")).toBe("6.06"); //  text.muted   / surface.base
    expect(ratioOf("CP-009")).toBe("5.60"); //  accent       / surface.base
  });

  test("FR-THM-005 AC-1: focusRing measures 3.93 on surface.base and 3.56 on surface.raised", () => {
    expect(ratioOf("CP-013")).toBe("3.93");
    expect(ratioOf("CP-014")).toBe("3.56");
    expect(ratioOf("CP-015")).toBe("3.34");
  });

  test("FR-THM-005 AC-2: border.control measures 3.23 on surface.raised", () => {
    expect(ratioOf("CP-016")).toBe("3.39");
    expect(ratioOf("CP-017")).toBe("3.23");
    expect(ratioOf("CP-018")).toBe("3.11");
  });

  test("FR-THM-005 AC-5: status.queued is nonText and clears 3:1 as text and as a marker dot", () => {
    expect(ratioOf("CP-024")).toBe("3.56");
    expect(ratioOf("CP-039")).toBe("3.56");
    expect(resultOf(report, "CP-024").usage).toBe("nonText");
    expect(resultOf(report, "CP-024").threshold).toBe(3);
  });

  test("FR-A11Y-004 AC-4: the focus ring and border.control are held to the non-text 3:1 bar", () => {
    const ids = ["CP-013", "CP-014", "CP-015", "CP-016", "CP-017", "CP-018"];
    const nonText = ids.map((id) => resultOf(report, id));
    expect(nonText.every((result) => result.usage === "nonText" && result.threshold === 3)).toBe(true);
    expect(nonText.every((result) => result.pass)).toBe(true);
  });

  test("FR-THM-004 AC-4: an alpha foreground is composited over its background before measuring", () => {
    const ring = resultOf(report, "CP-013");
    expect(ring.foregroundValue).toBe("0 0 0 3px rgba(109, 124, 255, 0.8)");
    expect(ring.compositedForeground).toBe("#5965d0");
  });

  test("FR-THM-004 AC-2: every result carries a body, large or nonText threshold", () => {
    for (const result of report.results) {
      expect(CONTRAST_THRESHOLDS[result.usage]).toBe(result.threshold);
    }
  });
});

describe("FR-A11Y-004 AC-3: the exclusion list", () => {
  const report = checkContrast();

  test("FR-THM-005 AC-4: border.subtle, default and strong are excluded, not measured", () => {
    const excluded = report.exclusions.map((exclusion) => exclusion.key);
    expect(excluded).toEqual(expect.arrayContaining(["border.subtle", "border.default", "border.strong"]));

    const measured = report.results.flatMap((result) => [result.foreground, result.background]);
    expect(measured).not.toContain("border.subtle");
    expect(measured).not.toContain("border.default");
    expect(measured).not.toContain("border.strong");
  });

  test("FR-THM-005 AC-6: status.neutralEnd is decorative, excluded, and prints its reason", () => {
    const neutralEnd = report.exclusions.find((exclusion) => exclusion.key === "status.neutralEnd");
    expect(neutralEnd?.usage).toBe("decorative");
    expect(neutralEnd?.reason).toContain("CR-006");
    expect(report.results.some((result) => result.foreground === "status.neutralEnd")).toBe(false);
    expect(formatExclusions(report).join("\n")).toContain("reason: Cancelled or superseded.");
  });

  test("FR-A11Y-004 AC-3: --report prints every excluded token with the reason from its description", () => {
    const printed = formatExclusions(report);
    expect(printed[0]).toContain(`${report.summary.excludedTokens} token(s) excluded`);
    for (const exclusion of report.exclusions) {
      expect(printed).toContain(`  ${exclusion.key}`);
      expect(printed).toContain(`    reason: ${exclusion.reason}`);
    }
    expect(printed.at(-1)).toBe("[contrast] --report: no files written");
  });

  test("FR-THM-005 AC-6: CP-025 stays retired rather than renumbered", () => {
    const ids = contrastPairs.map((pair) => pair.id);
    expect(ids).not.toContain("CP-025");
    expect(ids).toEqual(expect.arrayContaining(["CP-024", "CP-026"]));
  });
});

describe("FR-THM-004 AC-3: a pair below its threshold", () => {
  // `text.muted` darkened until it can no longer carry body text on `surface.base`.
  const report = checkContrast({ themes: [themeWith({ "text.muted": "#3a4453" })] });

  test("FR-THM-004 AC-3: a failing pair does not pass and drives exit code 1", () => {
    expect(report.summary.failed).toBeGreaterThan(0);
    expect(exitCodeFor(report)).toBe(1);
  });

  test("FR-THM-004 AC-3: the failure line prints the pair, theme, measured ratio and threshold", () => {
    const failure = resultOf(report, "CP-006");
    expect(failure.pass).toBe(false);

    const line = formatResult(failure);
    expect(line).toContain("theme=dark");
    expect(line).toContain("id=CP-006");
    expect(line).toContain("pair=text.muted/surface.base");
    expect(line).toContain(`ratio=${failure.ratio.toFixed(2)}`);
    expect(line).toContain("threshold=4.50(body)");
    expect(line).toContain("FAIL");
  });

  test("FR-A11Y-004 AC-2: the summary counts the failures CI fails on", () => {
    expect(formatSummary(report)).toBe(
      `${report.summary.failed} of ${report.summary.checks} pairs checked failed contrast threshold`,
    );
  });
});

describe("FR-THM-004 AC-1: a malformed pair declaration is an error, never a silent pass", () => {
  test("FR-THM-004 AC-1: a pair naming an unknown token key fails with the pair and the key", () => {
    const error = thrownBy(() => checkContrast({ pairs: [pairOf("CP-900", "text.nonexistent", "surface.base")] }));
    expect(error.code).toBe("TOK-CP-UNKNOWN-KEY");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("pair: CP-900");
    expect(error.format()).toContain("foreground: text.nonexistent");
  });

  test("FR-A11Y-004 AC-3: a decorative token declared as a pair foreground is rejected", () => {
    const error = thrownBy(() =>
      checkContrast({ pairs: [pairOf("CP-901", "border.subtle", "surface.base", "nonText")] }),
    );
    expect(error.code).toBe("TOK-CP-DECORATIVE");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("foreground: border.subtle");
    expect(error.format()).toContain("reason it is excluded:");
  });

  test("FR-THM-005 AC-6: status.neutralEnd cannot be reintroduced as a pair without a CR", () => {
    const error = thrownBy(() =>
      checkContrast({ pairs: [pairOf("CP-025", "status.neutralEnd", "surface.raised", "nonText")] }),
    );
    expect(error.code).toBe("TOK-CP-DECORATIVE");
    expect(error.format()).toContain("Reclassifying it needs a CR");
  });

  test("FR-THM-004 AC-2: a pair whose threshold disagrees with the token's usage is rejected", () => {
    const error = thrownBy(() =>
      checkContrast({ pairs: [pairOf("CP-902", "text.primary", "surface.base", "nonText")] }),
    );
    expect(error.code).toBe("TOK-CP-USAGE");
    expect(error.format()).toContain("declares usage `body`");
    expect(error.format()).toContain("pair declares usage `nonText`");
  });

  test("FR-THM-004 AC-4: a value holding two colours cannot be measured", () => {
    const error = thrownBy(() => checkContrast({ pairs: [pairOf("CP-903", "text.primary", "elevation.overlay")] }));
    expect(error.code).toBe("TOK-CP-COLOR");
    expect(error.format()).toContain("colours found: 2");
  });

  test("FR-THM-004 AC-4: a value holding no colour cannot be measured", () => {
    const error = thrownBy(() => checkContrast({ pairs: [pairOf("CP-904", "text.primary", "font.sans")] }));
    expect(error.code).toBe("TOK-CP-COLOR");
    expect(error.format()).toContain("colours found: 0");
  });

  test("FR-THM-004 AC-4: a translucent background has no backdrop to composite against", () => {
    const error = thrownBy(() => checkContrast({ pairs: [pairOf("CP-905", "text.primary", "surface.overlay")] }));
    expect(error.code).toBe("TOK-CP-ALPHA");
    expect(error.format()).toContain("background: surface.overlay");
  });

  test("FR-THM-004 AC-1: two pairs may not claim the same CP id", () => {
    const duplicate = pairOf("CP-001", "text.primary", "surface.base");
    const error = thrownBy(() => checkContrast({ pairs: [duplicate, duplicate] }));
    expect(error.code).toBe("TOK-CP-DUPLICATE-ID");
    expect(error.format()).toContain("CP ids are permanent");
  });
});

describe("API-TOK-003: the checkContrast CLI contract", () => {
  test("API-TOK-003: flags default to --theme all and dist output", () => {
    expect(parseContrastArgs([])).toEqual({ theme: "all", report: false, outDir: "dist" });
    expect(parseContrastArgs(["--theme", "dark", "--report"])).toEqual({
      theme: "dark",
      report: true,
      outDir: "dist",
    });
  });

  test("API-TOK-003: an unrecognised or incomplete argument exits 3", () => {
    expect(thrownBy(() => parseContrastArgs(["--nope"])).exitCode).toBe(3);
    expect(thrownBy(() => parseContrastArgs(["--theme"])).exitCode).toBe(3);
  });

  test("API-TOK-003: --theme all selects every defined theme, and --theme dark only that one", () => {
    expect(selectThemes(THEME_SOURCES, "all")).toEqual(THEME_SOURCES);
    expect(selectThemes(THEME_SOURCES, "dark")).toEqual([DARK]);
  });

  test("FR-THM-002 AC-1: the light theme is selectable", () => {
    expect(selectThemes(THEME_SOURCES, "light").map((theme) => theme.theme)).toEqual(["light"]);
  });

  test("FR-DOC-004: contrast-report.json carries every field W-030 renders", () => {
    const parsed = JSON.parse(renderReportJson(checkContrast())) as {
      themes: string[];
      thresholds: Record<string, number>;
      summary: Record<string, number>;
      results: Record<string, unknown>[];
      exclusions: Record<string, unknown>[];
    };

    expect(parsed.themes).toEqual(["dark", "light"]);
    expect(parsed.thresholds).toEqual({ body: 4.5, large: 3, nonText: 3 });
    expect(parsed.summary.failed).toBe(0);
    expect(parsed.results).toHaveLength(contrastPairs.length * 2);
    expect(parsed.results[0]).toMatchObject({
      id: "CP-001",
      theme: "dark",
      foreground: "text.primary",
      background: "surface.base",
      compositedForeground: "#f4f7fb",
      usage: "body",
      threshold: 4.5,
      pass: true,
    });
    expect(parsed.exclusions[0]).toHaveProperty("reason");
  });
});
