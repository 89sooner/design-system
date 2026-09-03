/**
 * The `cdt-` class contract between `@conductor-by-89soone/css` and `@conductor-by-89soone/react`.
 *
 * A class name is the only thing the two packages share. The stylesheet ships rules keyed by class;
 * the React primitives emit those keys. Nothing in the build checks that the two sides still agree,
 * so a renamed rule or a deleted component leaves a class that paints nothing — or a rule nothing
 * ever selects. Both failures are silent: the component renders, the page loads, the visual is
 * simply wrong.
 *
 * This test closes that gap in both directions:
 *
 *  - **React → CSS.** Every class a component puts on an element must be a class the stylesheet
 *    rules on, unless it is declared in `IDENTITY_CLASSES` below.
 *  - **CSS → React.** Every `cdt-` class the stylesheet rules on must be one a component emits,
 *    unless it is declared in `CONSUMER_CLASSES` — the framework-agnostic half of the package,
 *    which has no React component by design (FR-CSS-002 AC-5, FR-CSS-003 AC-1).
 *
 * Reading React's source from the CSS package does not reverse the dependency direction
 * (FR-DX-001 AC-1): this is a text read in a test, not an import, and `packages/css/package.json`
 * gains no edge. The contract is genuinely mutual, and the test has to sit on one side of it.
 *
 * **Known limit.** A class assembled from a template literal (`cdt-btn--${variant}`) contributes a
 * prefix, not a full name, because the variant union lives in React's type system and this test
 * does not typecheck. A prefix satisfies the CSS → React direction for any class that starts with
 * it, so a stale `.cdt-btn--*` rule can still hide. Whole-name drift — the case that has actually
 * happened — is caught exactly.
 *
 * Refs: WP-008 WP-011 FR-CSS-004 FR-CMP-001 FR-DX-001
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { readBuilt } from "./helpers.js";

const REACT_SOURCE_DIR = fileURLToPath(new URL("../../react/src", import.meta.url));

/**
 * Classes React emits as a stable targeting hook rather than a request for styling. Each one names
 * an element a consumer may want to select while the visual comes from a sibling class, so the
 * absence of a rule is the design, not drift.
 */
const IDENTITY_CLASSES: Readonly<Record<string, string>> = {
  "cdt-status-badge": "StatusBadge identity; `cdt-badge` paints the box and `cdt-status-badge--*` the fill.",
  "cdt-table__body": "`<tbody>` hook; the row and cell classes carry every rule.",
  "cdt-dialog__close": "Dialog close hook; the button classes beside it carry the rules.",
  "cdt-drawer__close": "Drawer close hook; the button classes beside it carry the rules.",
};

/**
 * Classes the stylesheet owns alone. `@conductor-by-89soone/css` is framework-agnostic
 * (ADR-002): the layout primitives and utilities are written by hand in consumer markup and have
 * no React component to emit them.
 */
const CONSUMER_CLASSES: Readonly<Record<string, string>> = {
  "cdt-page": "FR-CSS-003 AC-1 layout primitive.",
  "cdt-split-layout": "FR-CSS-003 AC-1 layout primitive.",
  "cdt-content-stack": "FR-CSS-003 AC-1 layout primitive.",
  "cdt-muted": "WP-008 text utility.",
  "cdt-mono": "WP-008 text utility.",
  "cdt-badge__dismiss": "DEV-033: 소비자가 Badge 안의 제거 버튼에 붙인다. 컴포넌트가 자동으로 붙이면 제거 불가능한 배지에도 실린다.",
};

const CLASS_SELECTOR = /\.(cdt-[A-Za-z0-9_-]+)/g;
const CDT_TOKEN = /\bcdt-[A-Za-z0-9_-]*/g;

interface ReactUsage {
  /** Whole class names, with the file that emits each. */
  readonly whole: ReadonlyMap<string, string>;
  /** Static heads of interpolated class names, e.g. `cdt-btn--tone-`. */
  readonly prefixes: readonly string[];
}

/** The `cx(…)` argument list, from the opening paren to its balanced close. */
function callArguments(source: string, openIndex: number): string {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "(") depth += 1;
    else if (character === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  return source.slice(openIndex + 1);
}

/**
 * Regions of a source file that produce a class attribute: every `cx(…)` argument list and every
 * `className=…` value. Scanning the whole file instead would read `mainId = "cdt-main"` — an id,
 * not a class — as a missing rule.
 */
function classRegions(source: string): string[] {
  const regions: string[] = [];
  for (const match of source.matchAll(/\bcx\(/g)) {
    regions.push(callArguments(source, match.index + match[0].length - 1));
  }
  for (const match of source.matchAll(/\bclassName=(?:"([^"]*)"|\{"([^"]*)"\}|\{`([^`]*)`\})/g)) {
    regions.push(match[1] ?? match[2] ?? match[3] ?? "");
  }
  return regions;
}

function reactSourceFiles(): string[] {
  // `src/testing/**` is excluded: its fixtures name classes no shipped component emits.
  return readdirSync(REACT_SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function reactClassUsage(): ReactUsage {
  const whole = new Map<string, string>();
  const prefixes = new Set<string>();

  for (const name of reactSourceFiles()) {
    const source = readFileSync(`${REACT_SOURCE_DIR}/${name}`, "utf8");
    for (const region of classRegions(source)) {
      // A template literal contributes its static head; every other token is a whole name.
      for (const literal of region.split("`")) {
        for (const token of literal.match(CDT_TOKEN) ?? []) {
          if (literal.includes("${") && literal.startsWith(token) && literal.slice(token.length).startsWith("${")) {
            prefixes.add(token);
          } else if (!whole.has(token)) {
            whole.set(token, `packages/react/src/${name}`);
          }
        }
      }
    }
  }

  return { whole, prefixes: [...prefixes].sort() };
}

const usage = reactClassUsage();
const styled = new Set([...readBuilt("../dist/index.css").matchAll(CLASS_SELECTOR)].map((match) => match[1] as string));

const startsWithAPrefix = (className: string): boolean =>
  usage.prefixes.some((prefix) => className.startsWith(prefix) && className !== prefix);

describe("cdt- class contract between the stylesheet and the React primitives", () => {
  test("the extraction found both sides, so an empty set cannot pass as agreement", () => {
    expect(styled.size).toBeGreaterThan(50);
    expect(usage.whole.size).toBeGreaterThan(50);
    expect(usage.prefixes.length).toBeGreaterThan(0);
  });

  test("FR-CSS-004: every class a component emits has a rule in the shipped stylesheet", () => {
    const dead = [...usage.whole]
      .filter(([className]) => !styled.has(className) && IDENTITY_CLASSES[className] === undefined)
      .map(([className, file]) => `${className} (emitted by ${file}, no rule in dist/index.css)`);
    expect(dead).toEqual([]);
  });

  test("FR-CSS-004: every prefix a component interpolates has at least one rule", () => {
    const unmatched = usage.prefixes.filter((prefix) => ![...styled].some((className) => className.startsWith(prefix)));
    expect(unmatched).toEqual([]);
  });

  test("FR-CSS-004: every class the stylesheet rules on is emitted by a component or declared consumer-facing", () => {
    const orphans = [...styled]
      .filter(
        (className) =>
          !usage.whole.has(className) &&
          !startsWithAPrefix(className) &&
          CONSUMER_CLASSES[className] === undefined &&
          IDENTITY_CLASSES[className] === undefined,
      )
      .sort();
    expect(orphans).toEqual([]);
  });

  test("both allow-lists stay honest: an entry that no longer applies fails here", () => {
    // An identity class must still be emitted, and must still have no rule.
    for (const className of Object.keys(IDENTITY_CLASSES)) {
      expect(usage.whole.has(className), `${className} is no longer emitted by any component`).toBe(true);
      expect(styled.has(className), `${className} now has a rule; drop it from IDENTITY_CLASSES`).toBe(false);
    }
    // A consumer class must still be styled, and must still have no component emitting it.
    for (const className of Object.keys(CONSUMER_CLASSES)) {
      expect(styled.has(className), `${className} no longer has a rule`).toBe(true);
      expect(usage.whole.has(className), `${className} is emitted by a component; drop it from CONSUMER_CLASSES`).toBe(false);
    }
  });
});
