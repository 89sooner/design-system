import { gzipSync } from "node:zlib";
import { describe, expect, test } from "vitest";
import { inspectBundle } from "../checks.mjs";
import {
  hasLayerBlock,
  mediaRules,
  readBuilt,
  readSource,
  rulesInLayer,
  topLevelRules,
} from "./helpers.js";

const LAYER_STATEMENT = readSource("../src/layers.css").trim();
const GZIP_BUDGET_BYTES = 20 * 1024;

const index = readBuilt("../dist/index.css");
const component = readBuilt("../dist/component.css");
const bundles = [
  ["index.css", index],
  ["component.css", component],
] as const;

const selectorOf = (rules: { selector: string }[], match: RegExp): string | undefined =>
  rules.find((rule) => match.test(rule.selector))?.selector;

const ruleFor = (css: string, layer: string, match: RegExp) =>
  topLevelRules(css, layer).find((rule) => match.test(rule.selector));

describe("FR-CSS-001 cascade layers", () => {
  test.each(bundles)(
    "FR-CSS-001 AC-4: %s fixes the layer order on one line at the very top",
    (_name, css) => {
      expect(css.split("\n")[0]).toBe(LAYER_STATEMENT);
      expect(LAYER_STATEMENT).toBe(
        "@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;",
      );
    },
  );

  test.each(bundles)("FR-CSS-001 AC-1: every rule in %s belongs to one of the five layers", (
    name,
    css,
  ) => {
    const offenders = inspectBundle(css, name).filter(
      (violation) =>
        violation.code === "CSS-UNLAYERED" || violation.code === "CSS-UNKNOWN-LAYER",
    );
    expect(offenders).toEqual([]);
  });

  test.each(bundles)("FR-CSS-001 AC-2: %s contains zero !important", (name, css) => {
    expect(css).not.toContain("!important");
    expect(inspectBundle(css, name).filter((v) => v.code === "CSS-IMPORTANT")).toEqual([]);
  });

  test.each(bundles)(
    "FR-CSS-001 AC-3: %s declares no unlayered rule, so an unlayered consumer rule wins at equal specificity",
    (name, css) => {
      // An unlayered rule beats any layered rule regardless of specificity, so
      // AC-3 holds exactly when Conductor ships nothing outside its layers.
      expect(inspectBundle(css, name).filter((v) => v.code === "CSS-UNLAYERED")).toEqual([]);
    },
  );

  test.each(bundles)("FR-CSS-001: %s passes every static output check", (name, css) => {
    expect(inspectBundle(css, name)).toEqual([]);
  });
});

describe("FR-CSS-002 reset and base layers", () => {
  test("FR-CSS-002 AC-1: box-sizing: border-box applies globally", () => {
    const rule = ruleFor(index, "cdt.reset", /^\*/);
    expect(rule?.decls["box-sizing"]).toBe("border-box");
    // the universal selector plus both pseudo-elements
    expect(rule?.selector.split(",").length).toBe(3);
  });

  test("FR-CSS-002 AC-2: button, input, textarea and select inherit the font", () => {
    const rule = ruleFor(index, "cdt.reset", /\bbutton\b.*\bselect\b/);
    expect(rule?.decls["font"]).toBe("inherit");
    for (const element of ["button", "input", "textarea", "select"]) {
      expect(rule?.selector.split(",")).toContain(element);
    }
  });

  test("FR-CSS-002 AC-3: :focus-visible takes the focus-ring token shadow and drops the outline", () => {
    const rule = ruleFor(index, "cdt.reset", /:focus-visible/);
    expect(rule?.decls["box-shadow"]).toBe("var(--cdt-focus-ring)");
    expect(rule?.decls["outline"]).toBe("none");
  });

  test.each(bundles)("FR-CSS-002 AC-4: %s references zero remote fonts", (name, css) => {
    expect(css).not.toMatch(/@import/);
    expect(css).not.toMatch(/url\(\s*['"]?(?:https?:)?\/\//i);
    expect(inspectBundle(css, name).filter((v) => v.code === "CSS-REMOTE-FONT")).toEqual([]);
  });

  test.each(bundles)("FR-CSS-002 AC-5: %s puts sr-only and skip-link in cdt.utility", (
    _name,
    css,
  ) => {
    const utility = topLevelRules(css, "cdt.utility");
    expect(selectorOf(utility, /^\.cdt-sr-only$/)).toBe(".cdt-sr-only");
    expect(selectorOf(utility, /^\.cdt-skip-link$/)).toBe(".cdt-skip-link");
  });

  test("FR-CSS-002 예외 처리: component.css is the same stylesheet without cdt.reset", () => {
    expect(hasLayerBlock(index, "cdt.reset")).toBe(true);
    expect(hasLayerBlock(component, "cdt.reset")).toBe(false);

    for (const layer of ["cdt.base", "cdt.utility"]) {
      expect(hasLayerBlock(component, layer)).toBe(true);
    }
    // the reset is the *only* difference
    expect(component.length).toBeLessThan(index.length);
  });

  test("WP-008: the five utility classes exist in cdt.utility", () => {
    const selectors = topLevelRules(index, "cdt.utility").map((rule) => rule.selector);
    for (const cls of [".cdt-sr-only", ".cdt-skip-link", ".cdt-muted", ".cdt-mono", ".cdt-num"]) {
      expect(selectors).toContain(cls);
    }
  });
});

describe("FR-CSS-005 reduced motion", () => {
  const reduced = (css: string) =>
    mediaRules(css, "cdt.base", /prefers-reduced-motion/).filter((rule) =>
      /reduce/.test(rule.media.join(" ")),
    );

  test.each(bundles)("FR-CSS-005 AC-4: %s scopes the reduced-motion rule to Conductor, never a bare *", (
    _name,
    css,
  ) => {
    const rules = reduced(css);
    expect(rules.length).toBeGreaterThan(0);

    for (const rule of rules) {
      for (const selector of rule.selector.split(",").map((part) => part.trim())) {
        expect(selector).not.toBe("*");
        expect(selector).toMatch(/^(?::root|\[data-cdt-theme\])/);
      }
    }
  });

  test.each(bundles)("FR-CSS-005 AC-1: %s zeroes transition and animation duration under reduced motion", (
    _name,
    css,
  ) => {
    const rules = reduced(css);

    // The load-bearing half: components read durations from these tokens, and a
    // later layer can never out-rank cdt.base, so the value is what must change.
    const tokens = rules.find((rule) => rule.decls["--cdt-motion-fast"] !== undefined);
    for (const token of ["--cdt-motion-fast", "--cdt-motion-standard", "--cdt-motion-bounce", "--cdt-motion-spin"]) {
      expect(tokens?.decls[token]).toMatch(/^0s\b/);
    }

    const durations = rules.find((rule) => rule.decls["transition-duration"] !== undefined);
    expect(durations?.decls["transition-duration"]).toBe("0s");
    expect(durations?.decls["animation-duration"]).toBe("0s");
  });

  test.each(bundles)("FR-CSS-005 AC-1: %s keeps component transitions linked to live motion tokens", (
    _name,
    css,
  ) => {
    expect(css).not.toMatch(/var\(--cdt-(?:button|card-interactive|table-row|input)-transition\)/);
    expect(css.match(/var\(--cdt-motion-(?:fast|standard|bounce)\)/g)?.length ?? 0).toBeGreaterThan(0);
  });

  test.each(bundles)("FR-CSS-005 AC-3: %s sets scroll-behavior: auto under reduced motion", (
    _name,
    css,
  ) => {
    const rule = reduced(css).find((entry) => entry.decls["scroll-behavior"] !== undefined);
    expect(rule?.decls["scroll-behavior"]).toBe("auto");
  });

  test("FR-CSS-005 AC-4: the rule lives in cdt.base, not another layer", () => {
    // The positive assertion comes first on purpose: without it, a mediaRules()
    // that always returned [] would satisfy the absence checks below.
    expect(mediaRules(index, "cdt.base", /prefers-reduced-motion/).length).toBeGreaterThan(0);

    for (const layer of ["cdt.reset", "cdt.layout", "cdt.component", "cdt.utility"]) {
      expect(mediaRules(index, layer, /prefers-reduced-motion/)).toEqual([]);
    }
  });
});

describe("FR-CSS-003 layout primitives", () => {
  const layout = topLevelRules(index, "cdt.layout");
  const tokenRoot = topLevelRules(index, "cdt.base").find((rule) => rule.selector.includes(":root"));
  const cardGridMinColumn = tokenRoot?.decls["--cdt-card-grid-min-column"];
  const breakpoint = {
    sm: tokenRoot?.decls["--cdt-breakpoint-sm"] ?? "$^",
    md: tokenRoot?.decls["--cdt-breakpoint-md"] ?? "$^",
  };

  test("FR-CSS-003 AC-1: all five layout classes exist in cdt.layout", () => {
    const selectors = layout.map((rule) => rule.selector);
    for (const cls of [
      ".cdt-app-shell",
      ".cdt-split-layout",
      ".cdt-card-grid",
      ".cdt-page",
      ".cdt-content-stack",
    ]) {
      expect(selectors).toContain(cls);
    }
  });

  test("FR-CSS-003 AC-2: split layout becomes one column at the md breakpoint", () => {
    const rule = mediaRules(index, "cdt.layout", new RegExp(breakpoint.md)).find(
      (entry) => entry.selector === ".cdt-split-layout",
    );
    expect(rule?.decls["grid-template-columns"]).toBe("minmax(0,1fr)");
  });

  test("FR-CSS-003 AC-3: card grid uses the tokenised minimum in auto-fill columns", () => {
    const rule = layout.find((entry) => entry.selector === ".cdt-card-grid");
    expect(Number.parseInt(cardGridMinColumn ?? "", 10)).toBe(320);
    expect(rule?.decls["grid-template-columns"]?.replaceAll(" ", "")).toBe(
      "repeat(auto-fill,minmax(var(--cdt-card-grid-min-column),1fr))",
    );
  });

  test("FR-CSS-003 AC-3: card grid becomes one column at the sm breakpoint", () => {
    const rule = mediaRules(index, "cdt.layout", new RegExp(breakpoint.sm)).find(
      (entry) => entry.selector === ".cdt-card-grid",
    );
    expect(rule?.decls["grid-template-columns"]).toBe("minmax(0,1fr)");
  });

  test("FR-CSS-003 AC-4: layout classes declare no colour properties", () => {
    const colourProperty = /(?:^|-)color$|^background|^border|^box-shadow$|^fill$|^stroke$/;
    for (const rule of rulesInLayer(index, "cdt.layout")) {
      expect(Object.keys(rule.decls).filter((property) => colourProperty.test(property))).toEqual([]);
    }
  });

  test.each(bundles)("FR-TOK-009 AC-2: %s contains literal media breakpoints, never variables", (
    _name,
    css,
  ) => {
    expect(mediaRules(css, "cdt.layout", new RegExp(breakpoint.md)).length).toBeGreaterThan(0);
    expect(mediaRules(css, "cdt.layout", new RegExp(breakpoint.sm)).length).toBeGreaterThan(0);
    expect(css).not.toMatch(/@media[^{}]*var\(\s*--cdt-breakpoint-/);
  });

  test("FR-TOK-009 AC-2: layout source names breakpoint tokens instead of copying values", () => {
    const source = readSource("../src/layout.css");
    expect(source).toContain("{breakpoint.md}");
    expect(source).toContain("{breakpoint.sm}");
    expect(source).not.toContain(`@media (max-width: ${breakpoint.md})`);
    expect(source).not.toContain(`@media (max-width: ${breakpoint.sm})`);
  });
});

describe("FR-CMP-009 shell components", () => {
  const componentRules = topLevelRules(index, "cdt.component");
  const tokenRoot = topLevelRules(index, "cdt.base").find((rule) => rule.selector.includes(":root"));
  const md = tokenRoot?.decls["--cdt-breakpoint-md"] ?? "$^";

  test.each(bundles)("FR-CMP-009: %s contains every shell component class", (_name, css) => {
    const selectors = rulesInLayer(css, "cdt.component").map((rule) => rule.selector);
    for (const selector of [".cdt-app-shell__nav", ".cdt-app-shell__main", ".cdt-nav-list", ".cdt-nav-list__item", ".cdt-topbar"]) {
      expect(selectors).toContain(selector);
    }
  });

  test("FR-CMP-009 AC-3: desktop navigation becomes a mobile Radix surface at the md breakpoint", () => {
    const rules = mediaRules(index, "cdt.component", new RegExp(md));
    expect(rules.find((rule) => rule.selector === ".cdt-app-shell__nav:not([data-mobile])")?.decls.display).toBe("none");
    expect(rules.find((rule) => rule.selector === ".cdt-app-shell__nav[data-mobile]")?.decls.position).toBe("fixed");
    expect(rules.find((rule) => rule.selector === ".cdt-app-shell__overlay")?.decls.display).toBe("block");
  });

  test("C-071 / C-072: shell visuals resolve through public tokens", () => {
    expect(ruleFor(index, "cdt.component", /^\.cdt-app-shell$/)?.decls.background).toBe("var(--cdt-app-shell-background)");
    expect(ruleFor(index, "cdt.component", /^\.cdt-nav-list$/)?.decls.background).toBe("var(--cdt-nav-list-background)");
    expect(ruleFor(index, "cdt.component", /^\.cdt-topbar$/)?.decls.background).toBe("var(--cdt-top-bar-background)");
    expect(componentRules.find((rule) => rule.selector === ".cdt-app-shell__main")?.decls["max-inline-size"]).toBe("var(--cdt-app-shell-main-max-width)");
  });
});

describe("FR-DX-001 / NFR-001 packaging", () => {
  test("FR-DX-001 AC-4: the stylesheet consumes @conductor-by-89soone/tokens through its public entry point", () => {
    const source = readSource("../src/tokens.css");
    expect(source).toContain('@import "@conductor-by-89soone/tokens/tokens.css" layer(cdt.base);');
    expect(source).not.toMatch(/\.\.\/\.\.\/tokens/);
    expect(source).not.toMatch(/tokens\/(?:src|dist)\//);

    // and the tokens really are inlined into the artifact, inside cdt.base
    const base = topLevelRules(index, "cdt.base");
    const root = base.find((rule) => rule.selector.includes(":root"));
    expect(root?.decls["--cdt-accent"]).toBeDefined();
  });

  test.each(bundles)("NFR-001: %s stays within the 20KB gzip budget", (_name, css) => {
    const gzipped = gzipSync(css, { level: 9 }).length;
    expect(gzipped).toBeLessThanOrEqual(GZIP_BUDGET_BYTES);
  });

  test.each(bundles)("R-5: every custom property in %s is --cdt- prefixed", (name, css) => {
    expect(inspectBundle(css, name).filter((v) => v.code === "CSS-CUSTOM-PROPERTY")).toEqual([]);
  });
});

describe("FR-CSS-004 action and surface primitives", () => {
  const components = topLevelRules(index, "cdt.component");

  test("FR-CSS-004 AC-3: Button's public primary classes consume the same tokenised visual rules", () => {
    const primary = components.find((rule) => rule.selector.includes(".cdt-btn--primary"));
    expect(primary?.decls.background).toBe("var(--cdt-button-primary-background)");
    expect(primary?.decls.color).toBe("var(--cdt-button-primary-text)");
    expect(primary?.selector).toContain(".cdt-btn--primary");
  });

  test("FR-CSS-004 AC-4: component selectors avoid structural combinators", () => {
    for (const rule of components) expect(rule.selector).not.toMatch(/\s[>+]\s|:nth-child/);
  });

  test("FR-A11Y-001 AC-1: shadow-bearing components restore the shared focus ring in the component layer", () => {
    const focus = ruleFor(index, "cdt.reset", /:focus-visible/);
    expect(focus?.decls["box-shadow"]).toBe("var(--cdt-focus-ring)");

    const composedFocus = components.find((entry) =>
      entry.selector.includes(".cdt-btn:focus-visible") &&
      entry.selector.includes(".cdt-input:focus-visible"),
    );
    expect(composedFocus?.decls["box-shadow"]).toBe("var(--cdt-focus-ring)");
    expect(composedFocus?.decls.transition).toBe("none");
    for (const selector of [
      ".cdt-btn:focus-visible",
      ".cdt-card--interactive:focus-visible",
      ".cdt-input:focus-visible",
      ".cdt-textarea:focus-visible",
      ".cdt-select__trigger:focus-visible",
      ".cdt-switch:focus-visible",
      ".cdt-checkbox:focus-visible",
    ]) {
      expect(composedFocus?.selector.split(",").map((part) => part.trim())).toContain(selector);
    }
  });
});

describe("FR-CMP-004 status display styles", () => {
  const components = topLevelRules(index, "cdt.component");

  test("FR-CMP-004 AC-1: running status uses its semantic fill and tokenised text", () => {
    const running = components.find((rule) => rule.selector === ".cdt-status-badge--running");
    expect(running?.decls.background).toBe("var(--cdt-status-running)");
    expect(running?.decls.color).toBe("var(--cdt-badge-fill-text)");
  });

  test("FR-CMP-004 AC-4: destructive severity uses its semantic fill", () => {
    const destructive = components.find((rule) => rule.selector === ".cdt-severity-tag--destructive");
    expect(destructive?.decls.background).toBe("var(--cdt-severity-destructive)");
  });

  test("FR-A11Y-003: marker statuses retain a tokenised dot alongside their text", () => {
    const marker = components.find((rule) => rule.selector === ".cdt-status-badge__marker");
    expect(marker?.decls.background).toBe("var(--cdt-status-queued)");
    expect(marker?.decls.border).toBe("var(--cdt-badge-marker-dot-ring-width) solid var(--cdt-badge-marker-dot-ring)");
  });

  test("CR-035: the two marker statuses differ by shape, not only by colour", () => {
    // queued is a filled dot; the end state is a ring. Two greys told apart by fill alone would
    // put the whole distinction on a contrast ratio.
    const end = components.find((rule) => rule.selector === ".cdt-status-badge__marker--neutral-end");
    // cdt-allow-literal: lightningcss가 transparent를 출력하는 형태에 대한 단언이다
    expect(end?.decls["background-color"]).toBe("#0000");
    expect(end?.decls["border-color"]).toBe("var(--cdt-status-neutral-end)");
  });
});

describe("FR-CMP-005 data display styles", () => {
  const components = topLevelRules(index, "cdt.component");

  test("FR-CMP-005 AC-1: Table has a scroll owner and becomes scrollable below the md breakpoint", () => {
    const scroll = components.find((rule) => rule.selector === ".cdt-table__scroll");
    expect(scroll?.decls["overflow-x"]).toBe("auto");
    const root = topLevelRules(index, "cdt.base").find((rule) => rule.selector.includes(":root"));
    const breakpoint = root?.decls["--cdt-breakpoint-md"] ?? "$^";
    const responsive = mediaRules(index, "cdt.component", new RegExp(breakpoint)).find((rule) => rule.selector === ".cdt-table");
    expect(responsive?.decls["min-inline-size"]).toBe("var(--cdt-table-scroll-breakpoint)");
  });

  test("FR-CMP-005 AC-2: cdt-num provides tabular numerals", () => {
    const numeric = topLevelRules(index, "cdt.utility").find((rule) => rule.selector === ".cdt-num");
    expect(numeric?.decls["font-variant-numeric"]).toBe("tabular-nums");
  });

  test("FR-CMP-005 AC-4: CodeBlock owns horizontal scrolling and a monospaced font", () => {
    const block = components.find((rule) => rule.selector === ".cdt-code-block");
    const pre = components.find((rule) => rule.selector === ".cdt-code-block__pre");
    expect(block?.decls["overflow-x"]).toBe("auto");
    expect(pre?.decls["font-family"]).toBe("var(--cdt-font-mono)");
  });

  test("FR-A11Y-001 exception: interactive Timeline focus lifts above its clipped parent", () => {
    const focused = components.find((rule) => rule.selector === ".cdt-timeline__step--interactive:focus-visible");
    expect(focused?.decls.position).toBe("relative");
    expect(focused?.decls["z-index"]).toBe("var(--cdt-z-sticky)");
  });
});

describe("FR-CMP-006 Radix overlay styles", () => {
  const components = topLevelRules(index, "cdt.component");

  test("FR-CMP-006 AC-4: overlay and content consume their z-index tokens", () => {
    const overlay = components.find((rule) => rule.selector === ".cdt-overlay");
    expect(overlay?.decls["z-index"]).toBe("var(--cdt-overlay-scrim-z)");
    const positioned = components.find((rule) => rule.selector === ".cdt-dialog");
    expect(positioned?.decls["z-index"]).toBe("var(--cdt-overlay-content-z)");
  });

  test("FR-CSS-004 AC-4: Radix state styling uses only supported data attributes", () => {
    const radixRules = components.filter((rule) => /cdt-(?:menu|tooltip|dialog|drawer)/.test(rule.selector) && rule.selector.includes("["));
    expect(radixRules.length).toBeGreaterThan(0);
    for (const rule of radixRules) {
      expect(rule.selector).toMatch(/\[data-(?:state|side|align|highlighted|disabled)(?:=[^\]]+)?\]/);
    }
  });

  test("FR-CMP-006: menu item highlighting is data-highlighted, not hover or focus", () => {
    const highlighted = components.find((rule) => rule.selector === ".cdt-menu__item[data-highlighted]");
    expect(highlighted?.decls.background).toBe("var(--cdt-accent-soft)");
    expect(components.some((rule) => rule.selector === ".cdt-menu__item:hover" || rule.selector === ".cdt-menu__item:focus")).toBe(false);
  });
});

describe("FR-CMP-007 form styles", () => {
  const components = topLevelRules(index, "cdt.component");

  test("FR-CMP-007 AC-5: form controls use the shared minimum-height token and compact breakpoint", () => {
    const controls = components.find((rule) => rule.selector.includes(".cdt-input,") && rule.selector.includes(".cdt-select__trigger"));
    expect(controls?.decls["min-block-size"]).toBe("var(--cdt-input-min-height)");
    const root = topLevelRules(index, "cdt.base").find((rule) => rule.selector.includes(":root"));
    const breakpoint = root?.decls["--cdt-breakpoint-sm"] ?? "$^";
    const compact = mediaRules(index, "cdt.component", new RegExp(breakpoint)).find((rule) => rule.selector.includes(".cdt-checkbox"));
    expect(compact?.decls["min-block-size"]).toBe("var(--cdt-input-min-height-compact)");
  });

  test("FR-CSS-004 AC-4: Radix form state styling uses data attributes", () => {
    const checked = components.find((rule) => rule.selector.includes(".cdt-switch[data-state=checked]"));
    const highlighted = components.find((rule) => rule.selector === ".cdt-select__item[data-highlighted]");
    expect(checked?.decls.background).toBe("var(--cdt-accent)");
    expect(highlighted?.decls.background).toBe("var(--cdt-accent-soft)");
  });
});

describe("FR-CMP-008 spinner animation", () => {
  // 토큰이 `<duration> <easing>`을 함께 치환하므로, 단축 선언에 이징 키워드를
  // 덧붙이면 이징이 둘이 되어 선언 전체가 무효가 된다 (DEV-028).
  const EASING_KEYWORD = /\b(?:linear|ease(?:-in-out|-in|-out)?|cubic-bezier\(|steps\()/;

  test.each(bundles)("%s: the spinner reads the linear spin token and nothing else", (_name, css) => {
    const spinner = ruleFor(css, "cdt.component", /^\.cdt-spinner svg$/);
    expect(spinner?.decls["animation"]).toMatch(/^cdt-spin var\(--cdt-motion-spin\) infinite$/);
  });

  test.each(bundles)("%s: no animation shorthand pairs a motion token with a second easing", (_name, css) => {
    // rulesInLayer는 @media 안의 규칙까지 본다 — 좁은 화면 전용 드로어 진입(cdt-shell-enter)도 범위에 든다.
    const offenders = rulesInLayer(css, "cdt.component")
      .filter((rule) => {
        const animation = rule.decls["animation"];
        return animation !== undefined && animation.includes("var(--cdt-motion-") && EASING_KEYWORD.test(animation);
      })
      .map((rule) => rule.selector);
    expect(offenders).toEqual([]);
  });
});

describe("FR-CMP-008 AC-5 reduced-motion spinner label", () => {
  // 레이어 순서가 명시도를 이긴다. 숨김과 노출이 같은 레이어(cdt.base)에 있어야
  // 축소 모드의 노출 규칙이 적용된다 (DEV-029).
  test.each(bundles)("%s: the clipping rule lives in cdt.base, not cdt.component", (_name, css) => {
    const clipped = topLevelRules(css, "cdt.base").find((rule) => rule.selector === ".cdt-spinner__label");
    expect(clipped?.decls["position"]).toBe("absolute");
    expect(clipped?.decls["clip"]).toBe("rect(0, 0, 0, 0)");

    const inComponent = rulesInLayer(css, "cdt.component").filter(
      (rule) => rule.selector.split(",").some((part) => part.trim() === ".cdt-spinner__label"),
    );
    expect(inComponent).toEqual([]);
  });

  test.each(bundles)("%s: the spinner sizes its svg, not its box, so the revealed label can grow", (_name, css) => {
    const svg = ruleFor(css, "cdt.component", /^\.cdt-spinner svg$/);
    expect(svg?.decls["inline-size"]).toBe("var(--cdt-spinner-size)");
    expect(svg?.decls["block-size"]).toBe("var(--cdt-spinner-size)");
    // 계획 001의 시험과 같은 규칙을 본다 — 기하만 담은 동명 규칙을 앞에 두지 않는다.
    expect(svg?.decls["animation"]).toBe("cdt-spin var(--cdt-motion-spin) infinite");

    const box = topLevelRules(css, "cdt.component").find((rule) => rule.selector === ".cdt-spinner");
    expect(box).toBeUndefined();
  });

  test.each(bundles)("%s: reduced motion reveals the label from the same layer with higher specificity", (_name, css) => {
    const reveal = mediaRules(css, "cdt.base", /prefers-reduced-motion/).find(
      (rule) => /reduce/.test(rule.media.join(" ")) && rule.selector.includes(".cdt-spinner__label"),
    );
    expect(reveal?.decls["position"]).toBe("static");
    expect(reveal?.decls["clip"]).toBe("auto");
    for (const part of reveal?.selector.split(",") ?? []) {
      expect(part.trim()).toMatch(/^(?::root|\[data-cdt-theme\]) \.cdt-spinner__label$/);
    }
  });
});

describe("FR-CMP-006 overlay exit", () => {
  const reducedRules = (css: string) =>
    mediaRules(css, "cdt.base", /prefers-reduced-motion/).filter((rule) =>
      /reduce/.test(rule.media.join(" ")),
    );

  test.each(bundles)("%s: overlay and dialog animate out through the fast token with fill-mode forwards", (_name, css) => {
    // dist는 속성 선택자의 따옴표를 지운다 — 저장소의 기존 시험과 같은 표기를 쓴다.
    for (const selector of [/^\.cdt-overlay\[data-state=closed\]$/, /^\.cdt-dialog\[data-state=closed\]$/]) {
      const rule = ruleFor(css, "cdt.component", selector);
      expect(rule?.decls["animation"]).toMatch(/^cdt-(?:overlay|dialog)-exit var\(--cdt-motion-fast\) forwards$/);
    }
  });

  test.each(bundles)("%s: reduced motion hides the closed state so Presence unmounts without waiting", (_name, css) => {
    // 0s 애니메이션의 animationend에 기대지 않는다 — display: none이면 Presence가 즉시 언마운트한다.
    const hidden = reducedRules(css).filter((rule) => rule.decls["display"] === "none");
    const selectors = hidden.flatMap((rule) => rule.selector.split(",").map((part) => part.trim()));
    expect(selectors.some((part) => part.endsWith(".cdt-dialog[data-state=closed]"))).toBe(true);
    expect(selectors.some((part) => part.endsWith(".cdt-overlay[data-state=closed]"))).toBe(true);
  });

  test.each(bundles)("%s: the mobile drawer never gets a closed-state animation (display: flex beats the reduced-motion escape)", (_name, css) => {
    expect(css).not.toMatch(/\.cdt-app-shell__(?:overlay|nav)[^{]*\[data-state=closed\]/);
  });
});
