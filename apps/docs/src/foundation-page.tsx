// Refs: WP-019 FR-DOC-002 FR-TOK-007 FR-CSS-003 FR-CSS-005
import { Banner, Button, CodeBlock, Panel, ProgressRing, Spinner, Switch, Table } from "@conductor-by-89soone/react";
import { useEffect, useMemo, useState } from "react";
import { tokensFor, valueFor, type FoundationToken } from "./foundations";
import type { Theme } from "./theme";

type FoundationGroup = "color" | "typography" | "spacing" | "elevation" | "motion";

function TokenPreview({ token, theme }: { readonly token: FoundationToken; readonly theme: Theme }) {
  const value = valueFor(token, theme);
  if (/^(?:#|rgb|hsl)/i.test(value)) return <span className="docs-token-swatch" style={{ background: value }} aria-hidden="true" />;
  if (token.key === "focusRing") return <span className="docs-token-shape" style={{ boxShadow: value }} aria-hidden="true" />;
  if (token.key === "font.sans") return <span className="docs-token-type" style={{ fontFamily: value }} aria-hidden="true">Ag</span>;
  if (token.key === "font.mono") return <span className="docs-token-type" style={{ fontFamily: value }} aria-hidden="true">01</span>;
  if (token.key.startsWith("font.size.")) return <span className="docs-token-type" style={{ fontSize: value }} aria-hidden="true">Aa</span>;
  if (token.key.startsWith("font.lineHeight.")) return <span className="docs-token-type" style={{ lineHeight: value }} aria-hidden="true">Aa</span>;
  if (token.key.startsWith("space.")) return <span className="docs-token-space" style={{ inlineSize: value }} aria-hidden="true" />;
  if (token.key.startsWith("radius.")) return <span className="docs-token-shape" style={{ borderRadius: value }} aria-hidden="true" />;
  if (token.key.startsWith("elevation.")) return <span className="docs-token-shape" style={{ boxShadow: value }} aria-hidden="true" />;
  return <span className="docs-token-glyph" aria-hidden="true">{token.key.startsWith("motion.") ? "→" : "↔"}</span>;
}

function TokenTable({ tokens, theme }: { readonly tokens: FoundationToken[]; readonly theme: Theme }) {
  return <Table caption="Foundation tokens"><Table.Head><Table.Row><Table.HeaderCell>Preview</Table.HeaderCell><Table.HeaderCell>Token</Table.HeaderCell><Table.HeaderCell>Tier</Table.HeaderCell><Table.HeaderCell>Current value</Table.HeaderCell><Table.HeaderCell>Usage</Table.HeaderCell></Table.Row></Table.Head><Table.Body>{tokens.map((token) => <Table.Row key={token.key}><Table.Cell><TokenPreview token={token} theme={theme} /></Table.Cell><Table.Cell><code>{token.key}</code></Table.Cell><Table.Cell>{token.tier}</Table.Cell><Table.Cell><code>{valueFor(token, theme)}</code></Table.Cell><Table.Cell>{token.description?.trim() || "설명 없음"}</Table.Cell></Table.Row>)}</Table.Body></Table>;
}

function TypographyExample() {
  return <Panel as="section"><p className="docs-preview-meta">Responsive heading</p><h2 className="docs-type-example">Ship clear interfaces.</h2><p className="cdt-muted"><code>page.headingSize</code> derives a <code>clamp()</code> range from <code>font.size.xl</code>.</p></Panel>;
}

function LayoutExamples() {
  return <Panel as="section"><h2>Layout primitives</h2><p className="cdt-muted">Resize the viewport to see both primitives collapse at their tokenized breakpoints.</p><h3>Split layout</h3><div className="cdt-split-layout docs-layout-example" data-layout-example="split"><Panel size="sm">Primary workspace</Panel><Panel size="sm">Context panel</Panel></div><h3>Card grid</h3><div className="cdt-card-grid docs-layout-example" data-layout-example="card-grid"><Panel size="sm">Build</Panel><Panel size="sm">Test</Panel><Panel size="sm">Release</Panel></div><CodeBlock language="html" code={'<div class="cdt-split-layout">…</div>\n<div class="cdt-card-grid">…</div>'} /></Panel>;
}

function MotionExample({ reducedMotion, tokens, values }: { readonly reducedMotion: boolean; readonly tokens: readonly FoundationToken[]; readonly values: Readonly<Record<string, string>> }) {
  return <Panel as="section"><h2>Computed motion</h2><p className="cdt-muted">These values are read from the live CSS custom properties, so reduced motion displays <code>0s</code> rather than the build artifact duration.</p><dl className="docs-motion-values">{tokens.map((token) => <div key={token.key}><dt><code>{token.key}</code></dt><dd data-motion-value={token.key}><code>{values[token.key] ?? token.values.dark}</code></dd></div>)}</dl><div className="docs-motion-preview"><div><p className="docs-preview-meta">State transitions</p><div className="docs-preview-row"><Button data-motion-target="button" variant="primary">Hover or focus</Button><Switch data-motion-target="switch" aria-label="Selected motion example" defaultChecked /></div></div><div><p className="docs-preview-meta">Progress alternatives</p><div className="docs-preview-row"><ProgressRing aria-label="Motion example progress" value={64} valueText="64%" /><Spinner label="Loading preview" /></div></div></div><Banner tone="info">{reducedMotion ? "Reduced motion is enabled; final component states remain unchanged." : "Reduced motion is not enabled."}</Banner></Panel>;
}

export function FoundationPage({ group, theme, title }: { readonly group: FoundationGroup; readonly theme: Theme; readonly title: string }) {
  const tokens = useMemo(() => tokensFor(group), [group]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionValues, setMotionValues] = useState<Readonly<Record<string, string>>>({});

  useEffect(() => {
    if (group !== "motion") return undefined;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const root = window.getComputedStyle(document.documentElement);
      setReducedMotion(preference.matches);
      setMotionValues(Object.fromEntries(tokens.map((token) => [token.key, root.getPropertyValue(token.cssName).trim() || valueFor(token, theme)])));
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [group, theme, tokens]);

  const sectionDescription = group === "color" ? "Dark is the canonical palette; the current theme value is shown." : group === "spacing" ? "Breakpoints are compiled to media-query literals; CSS custom properties cannot be evaluated in media conditions." : group === "motion" ? "Motion values reflect the current system reduced-motion preference." : "Values come directly from the generated token artifact.";
  return <section className="cdt-page" aria-labelledby="foundation-title"><div><p className="docs-eyebrow">Foundations</p><h1 id="foundation-title">{title}</h1><p className="docs-lead">{sectionDescription}</p></div><TokenTable tokens={tokens} theme={theme} />{group === "typography" ? <TypographyExample /> : null}{group === "spacing" ? <LayoutExamples /> : null}{group === "motion" ? <MotionExample reducedMotion={reducedMotion} tokens={tokens} values={motionValues} /> : null}{group === "elevation" ? <Panel as="section">The z-index scale belongs to the token reference screen.</Panel> : null}{group === "color" ? <Panel as="section">Contrast results and pass/fail decisions belong to the token reference screen.</Panel> : null}</section>;
}
