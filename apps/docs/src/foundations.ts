// Refs: WP-019 FR-DOC-002
import tokenArtifact from "@conductor-by-89soone/tokens/tokens.json";
import type { Theme } from "./theme";

export interface FoundationToken {
  readonly key: string;
  readonly cssName: string;
  readonly tier: string;
  readonly usage?: string;
  readonly description?: string;
  readonly values: Record<Theme, string>;
}

export const foundationGroups = {
  color: ["surface.", "text.", "border.", "accent", "status.", "severity.", "meter.", "focusRing"],
  typography: ["font."],
  spacing: ["space.", "breakpoint."],
  elevation: ["radius.", "elevation."],
  motion: ["motion."],
} as const;

const tokens = tokenArtifact.tokens as FoundationToken[];

export function allPublicTokens(): FoundationToken[] {
  return tokens;
}

export function tokensFor(group: keyof typeof foundationGroups): FoundationToken[] {
  return tokens.filter((token) => foundationGroups[group].some((prefix) => token.key === prefix || token.key.startsWith(prefix)));
}

export function valueFor(token: FoundationToken, theme: Theme): string {
  return token.values[theme];
}
