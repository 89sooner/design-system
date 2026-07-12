// Refs: WP-019 WP-028 FR-DOC-002 NFR-001
import { Banner, CodeBlock, Panel, Table } from "@conductor/react";
import { useEffect, useState } from "react";
import { tokensFor, valueFor, type FoundationToken } from "./foundations";
import type { Theme } from "./theme";

function TokenTable({ tokens, theme }: { readonly tokens: FoundationToken[]; readonly theme: Theme }) {
  return <Table caption="Foundation tokens"><Table.Head><Table.Row><Table.HeaderCell>Preview</Table.HeaderCell><Table.HeaderCell>Token</Table.HeaderCell><Table.HeaderCell>Tier</Table.HeaderCell><Table.HeaderCell>Current value</Table.HeaderCell><Table.HeaderCell>Usage</Table.HeaderCell></Table.Row></Table.Head><Table.Body>{tokens.map((token) => <Table.Row key={token.key}><Table.Cell><span className="docs-token-swatch" style={{ background: valueFor(token, theme), boxShadow: token.key.startsWith("elevation.") ? valueFor(token, theme) : undefined, borderRadius: token.key.startsWith("radius.") ? valueFor(token, theme) : undefined }} aria-hidden="true" /></Table.Cell><Table.Cell><code>{token.key}</code></Table.Cell><Table.Cell>{token.tier}</Table.Cell><Table.Cell><code>{valueFor(token, theme)}</code></Table.Cell><Table.Cell>{token.description?.trim() || "설명 없음"}</Table.Cell></Table.Row>)}</Table.Body></Table>;
}

export function FoundationPage({ group, theme, title }: { readonly group: "color" | "typography" | "spacing" | "elevation" | "motion"; readonly theme: Theme; readonly title: string }) {
  const tokens = tokensFor(group);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const sectionDescription = group === "color" ? "Dark is the canonical palette; the current theme value is shown." : group === "spacing" ? "Breakpoints are compiled to media-query literals; CSS custom properties cannot be evaluated in media conditions." : group === "motion" ? "Motion values reflect the current system reduced-motion preference." : "Values come directly from the generated token artifact.";
  return <section className="cdt-page" aria-labelledby="foundation-title"><div><p className="docs-eyebrow">Foundations</p><h1 id="foundation-title">{title}</h1><p className="docs-lead">{sectionDescription}</p></div>{group === "motion" ? <Banner tone="info">{reducedMotion ? "Reduced motion is enabled." : "Reduced motion is not enabled."}</Banner> : null}<TokenTable tokens={tokens} theme={theme} />{group === "spacing" ? <Panel as="section"><h2>Layout primitives</h2><CodeBlock language="css" code="cdt-app-shell\ncdt-split-layout\ncdt-card-grid\ncdt-page\ncdt-content-stack" /></Panel> : null}{group === "elevation" ? <Panel as="section">The z-index scale belongs to the token reference screen.</Panel> : null}{group === "color" ? <Panel as="section">Contrast results and pass/fail decisions belong to the token reference screen.</Panel> : null}</section>;
}
