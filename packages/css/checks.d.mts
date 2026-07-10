/** Type surface for checks.mjs, which runs under node and is not compiled. */

export declare const LAYER_NAMES: readonly [
  "cdt.reset",
  "cdt.base",
  "cdt.layout",
  "cdt.component",
  "cdt.utility",
];

export interface Violation {
  code:
    | "CSS-IMPORTANT"
    | "CSS-UNLAYERED"
    | "CSS-UNKNOWN-LAYER"
    | "CSS-REMOTE-FONT"
    | "CSS-CUSTOM-PROPERTY";
  filename: string;
  line: number;
  column: number;
  message: string;
  hint?: string;
}

export declare function inspectBundle(css: string, filename?: string): Violation[];
export declare function formatViolations(violations: Violation[]): string;
