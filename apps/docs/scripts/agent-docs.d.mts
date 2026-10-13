/** Type surface for agent-docs.mjs, which runs under node and is not compiled. */
import type { ComponentMeta } from "../src/catalog";

export interface AgentToken {
  readonly key: string;
  readonly tier: string;
  readonly usage?: string;
  readonly description?: string;
  readonly values: Readonly<Record<string, string>>;
}

export interface ContrastSummary {
  readonly summary: { readonly checks: number; readonly passed: number; readonly failed: number };
}

export declare const DESIGN_MD_MAX_BYTES: number;
export declare function normaliseBase(base: string | undefined): string;
export declare function cell(value: unknown): string;
export declare function renderDesignMd(input: { tokens: readonly AgentToken[]; themes: readonly string[]; contrast: ContrastSummary; components: readonly ComponentMeta[]; version: string }): string;
export declare function renderTokensMd(input: { tokens: readonly AgentToken[]; themes: readonly string[]; version: string }): string;
export declare function renderComponentMd(component: ComponentMeta, options: { base: string }): string;
export declare function renderLlmsTxt(input: { components: readonly ComponentMeta[]; base: string; version: string }): string;
