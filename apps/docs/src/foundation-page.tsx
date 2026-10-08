// Refs: CR-042 WP-019 FR-DOC-002 FR-TOK-007 FR-CSS-003 FR-CSS-005
//
// W-010 to W-014. Every page keeps the single "Foundation tokens" table and adds a visual read of
// its group above it: a swatch gallery for colour, a type specimen and scale, a spacing ruler, the
// radius row and elevation stack, and the computed motion tiles. Colour previews take their value
// from the token artifact for the current theme (`valueFor`), never from a literal.
import { Badge, Banner, Button, CodeBlock, Panel, ProgressRing, Spinner, Switch, Table } from "@conductor-by-89soone/react";
import { ArrowRight, Braces, Layers } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { tokensFor, valueFor, type FoundationToken } from "./foundations";
import type { Theme } from "./theme";

type FoundationGroup = "color" | "typography" | "spacing" | "elevation" | "motion";

const COLOR_VALUE = /^(?:#|rgb|hsl)/i;

/** Token descriptions quote other keys in backticks; the page shows them as plain text. */
function plain(description: string | undefined): string {
  const text = description?.replace(/`/g, "").trim() ?? "";
  return text === "" ? "No description" : text;
}

/**
 * Break opportunities after each dot and before each capitalised segment, so a long key wraps along
 * its own structure, and only when the column is narrower than the key.
 */
function TokenKey({ value }: { readonly value: string }) {
  const pieces = value.split(/(?<=\.)|(?=[A-Z][a-z])/);
  return <code>{pieces.map((piece, index) => <span key={`${piece}-${index}`}>{index > 0 ? <wbr /> : null}{piece}</span>)}</code>;
}

function TokenPreview({ token, theme }: { readonly token: FoundationToken; readonly theme: Theme }) {
  const value = valueFor(token, theme);
  if (COLOR_VALUE.test(value)) return <span className="docs-token-swatch" style={{ background: value }} aria-hidden="true" />;
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

function TierBadge({ tier }: { readonly tier: string }) {
  return <Badge tone={tier === "semantic" ? "accent" : "neutral"}>{tier}</Badge>;
}

function TokenTable({ tokens, theme }: { readonly tokens: readonly FoundationToken[]; readonly theme: Theme }) {
  return (
    <Table caption="Foundation tokens">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Preview</Table.HeaderCell>
          <Table.HeaderCell>Token</Table.HeaderCell>
          <Table.HeaderCell>Tier</Table.HeaderCell>
          <Table.HeaderCell>Current value</Table.HeaderCell>
          <Table.HeaderCell>Usage</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {tokens.map((token) => (
          <Table.Row key={token.key}>
            <Table.Cell><TokenPreview token={token} theme={theme} /></Table.Cell>
            <Table.Cell className="docs-token-key"><TokenKey value={token.key} /></Table.Cell>
            <Table.Cell><TierBadge tier={token.tier} /></Table.Cell>
            <Table.Cell><code>{valueFor(token, theme)}</code></Table.Cell>
            <Table.Cell>{plain(token.description)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function SectionHead({ id, title, children, count }: { readonly id: string; readonly title: string; readonly children: ReactNode; readonly count?: number }) {
  const text = <div><h2 id={id}>{title}</h2><p>{children}</p></div>;
  if (count === undefined) return <div className="docs-section-head">{text}</div>;
  return <div className="docs-section-head docs-section-head--row">{text}<Badge>{count} tokens</Badge></div>;
}

function Pointer({ icon, title, text, to, cta }: { readonly icon: ReactNode; readonly title: string; readonly text: string; readonly to: string; readonly cta: string }) {
  return (
    <div className="docs-pointer">
      <div className="docs-pointer__body">
        <span className="docs-pointer__icon">{icon}</span>
        <div className="docs-pointer__text"><strong>{title}</strong><span>{text}</span></div>
      </div>
      <div className="docs-pointer__actions">
        <Link className="cdt-btn cdt-btn--secondary cdt-btn--tone-neutral" to={to}>{cta}<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

/* ---------- Colour: swatch gallery ---------- */

interface ColorFamily {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: "fill" | "text" | "border";
  readonly match: (key: string) => boolean;
}

const colorFamilies: readonly ColorFamily[] = [
  { id: "surface", title: "Surface", description: "Luminance steps build depth. A card sits one step above the page and an overlay one more; shadows only confirm what the step already says.", kind: "fill", match: (key) => key.startsWith("surface.") },
  { id: "text", title: "Text", description: "A short hierarchy, each step measured against every surface it may sit on. The faint step is reserved for metadata and never reaches body copy.", kind: "text", match: (key) => key.startsWith("text.") },
  { id: "border", title: "Border", description: "Hairlines for edges, and a stronger control step so a field stays findable without a fill.", kind: "border", match: (key) => key.startsWith("border.") && !key.startsWith("border.width.") },
  { id: "accent", title: "Accent and focus", description: "One accent, used sparingly, plus the focus ring every interactive element shares.", kind: "fill", match: (key) => key.startsWith("accent") || key === "focusRing" },
  { id: "status", title: "Status", description: "Seven lifecycle states. Each pairs with an icon and a label, so the colour is never the only signal.", kind: "fill", match: (key) => key.startsWith("status.") },
  { id: "severity", title: "Severity", description: "Fills for the impact of an action, from read-only through to blocked.", kind: "fill", match: (key) => key.startsWith("severity.") },
  { id: "meter", title: "Meter", description: "Fill colours for a meter below, near and past its thresholds.", kind: "fill", match: (key) => key.startsWith("meter.") },
];

function SwatchChip({ token, kind, value }: { readonly token: FoundationToken; readonly kind: ColorFamily["kind"]; readonly value: string }) {
  if (token.key === "focusRing") return <span className="docs-swatch__chip docs-swatch__chip--ring" style={{ boxShadow: value }} aria-hidden="true" />;
  if (kind === "text") {
    const onAccent = token.key === "text.inverse";
    return <span className={onAccent ? "docs-swatch__chip docs-swatch__chip--text docs-swatch__chip--on-accent" : "docs-swatch__chip docs-swatch__chip--text"} style={{ color: value }} aria-hidden="true">Aa</span>;
  }
  if (kind === "border") return <span className="docs-swatch__chip docs-swatch__chip--border" style={{ borderColor: value }} aria-hidden="true" />;
  return <span className="docs-swatch__chip" style={{ background: value }} aria-hidden="true" />;
}

function ColorGallery({ tokens, theme }: { readonly tokens: readonly FoundationToken[]; readonly theme: Theme }) {
  return (
    <div className="docs-swatch-gallery">
      {colorFamilies.map((family) => {
        const members = tokens.filter((token) => family.match(token.key));
        if (members.length === 0) return null;
        const headingId = `swatch-${family.id}`;
        return (
          <section key={family.id} className="docs-swatch-family" aria-labelledby={headingId}>
            <SectionHead id={headingId} title={family.title} count={members.length}>{family.description}</SectionHead>
            <ul className="docs-swatches">
              {members.map((token) => {
                const value = valueFor(token, theme);
                return (
                  <li key={token.key} className="docs-swatch">
                    <SwatchChip token={token} kind={family.kind} value={value} />
                    <code className="docs-swatch__key">{token.key}</code>
                    <span className="docs-swatch__value">{value}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Typography: specimen and scale ---------- */

function TypographyExample() {
  return (
    <Panel as="section" className="docs-specimen" aria-labelledby="specimen-title">
      <SectionHead id="specimen-title" title="Type specimen">Display and heading sizes are responsive ranges; lead and body copy are fixed steps from the scale.</SectionHead>
      <div className="docs-specimen__rows">
        <div className="docs-specimen__row">
          <span className="docs-preview-meta">Display · page.displaySize</span>
          <p className="docs-type-example--display">Design once, ship both themes.</p>
        </div>
        <div className="docs-specimen__row">
          <span className="docs-preview-meta">Heading · page.headingSize</span>
          <h2 className="docs-type-example">Ship clear interfaces.</h2>
          <p className="docs-specimen__note"><code>page.headingSize</code> derives a <code>clamp()</code> range from <code>font.size.xl</code>.</p>
        </div>
        <div className="docs-specimen__row">
          <span className="docs-preview-meta">Lead · page.leadSize</span>
          <p className="docs-specimen__lead">A lead paragraph introduces a screen in one or two sentences and then gets out of the way.</p>
        </div>
        <div className="docs-specimen__row">
          <span className="docs-preview-meta">Body · font.size.md</span>
          <p className="docs-specimen__body">Body copy keeps dense operational screens readable: a compact size with generous line height, and a monospace step for payloads such as <code>run-4f2c</code>.</p>
        </div>
      </div>
    </Panel>
  );
}

function TypeScale({ tokens, theme }: { readonly tokens: readonly FoundationToken[]; readonly theme: Theme }) {
  const sizes = tokens.filter((token) => token.key.startsWith("font.size."));
  return (
    <Panel as="section" aria-labelledby="type-scale-title">
      <SectionHead id="type-scale-title" title="Scale">Seven fixed steps. Each size pairs with its own line height, listed in the table below.</SectionHead>
      <ul className="docs-type-scale">
        {sizes.map((token) => {
          const step = token.key.slice("font.size.".length);
          const lineHeight = tokens.find((candidate) => candidate.key === `font.lineHeight.${step}`);
          const style: CSSProperties = lineHeight === undefined ? { fontSize: valueFor(token, theme) } : { fontSize: valueFor(token, theme), lineHeight: valueFor(lineHeight, theme) };
          return (
            <li key={token.key} className="docs-type-scale__item">
              <span className="docs-type-scale__sample" style={style} aria-hidden="true">Ag</span>
              <span className="docs-type-scale__label"><code>{step}</code> {valueFor(token, theme)}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------- Spacing: ruler and live layout primitives ---------- */

function SpacingRuler({ tokens, theme }: { readonly tokens: readonly FoundationToken[]; readonly theme: Theme }) {
  const steps = tokens.filter((token) => token.key.startsWith("space."));
  const breakpoints = tokens.filter((token) => token.key.startsWith("breakpoint."));
  return (
    <Panel as="section" aria-labelledby="spacing-scale-title">
      <SectionHead id="spacing-scale-title" title="Spacing scale">Eight steps. Every gap, padding and inset in the system reads one of them, so rhythm stays consistent across screens.</SectionHead>
      <ol className="docs-ruler">
        {steps.map((token) => (
          <li key={token.key} className="docs-ruler__row">
            <code className="docs-ruler__key">{token.key}</code>
            <span className="docs-ruler__track"><span className="docs-ruler__bar" style={{ inlineSize: valueFor(token, theme) }} aria-hidden="true" /></span>
            <span className="docs-ruler__value">{valueFor(token, theme)}</span>
          </li>
        ))}
      </ol>
      <div className="docs-section-head">
        <h3>Breakpoints</h3>
        <p>Substituted into media-query literals by the stylesheet build, because a custom property cannot be read inside a media condition.</p>
      </div>
      <ul className="docs-chips">
        {breakpoints.map((token) => <li key={token.key}><Badge>{token.key} · {valueFor(token, theme)}</Badge></li>)}
      </ul>
    </Panel>
  );
}

function LayoutExamples() {
  return (
    <Panel as="section" aria-labelledby="layout-title">
      <SectionHead id="layout-title" title="Layout primitives">Resize the viewport to see both primitives collapse at their tokenized breakpoints.</SectionHead>
      <div className="docs-layout-block">
        <h3>Split layout</h3>
        <div className="cdt-split-layout docs-layout-example" data-layout-example="split"><Panel size="sm">Primary workspace</Panel><Panel size="sm">Context panel</Panel></div>
      </div>
      <div className="docs-layout-block">
        <h3>Card grid</h3>
        <div className="cdt-card-grid docs-layout-example" data-layout-example="card-grid"><Panel size="sm">Build</Panel><Panel size="sm">Test</Panel><Panel size="sm">Release</Panel></div>
      </div>
      <CodeBlock language="html" code={'<div class="cdt-split-layout">…</div>\n<div class="cdt-card-grid">…</div>'} />
    </Panel>
  );
}

/* ---------- Radius and elevation ---------- */

function ElevationExamples({ tokens, theme }: { readonly tokens: readonly FoundationToken[]; readonly theme: Theme }) {
  const radii = tokens.filter((token) => token.key.startsWith("radius."));
  return (
    <>
      <Panel as="section" aria-labelledby="radius-title">
        <SectionHead id="radius-title" title="Corner radius">Chips take the small steps, cards the large ones, and a pill is reserved for toggles and tags.</SectionHead>
        <ul className="docs-radius-row">
          {radii.map((token) => (
            <li key={token.key} className="docs-radius-row__item">
              <span className="docs-radius-row__shape" style={{ borderRadius: valueFor(token, theme) }} aria-hidden="true" />
              <code>{token.key.slice("radius.".length)}</code>
              <span className="docs-radius-row__value">{valueFor(token, theme)}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel as="section" aria-labelledby="elevation-title">
        <SectionHead id="elevation-title" title="Elevation stack">Depth comes from a luminance step and a hairline highlight; the shadow only grows with interaction.</SectionHead>
        <div className="docs-canvas docs-elevation-stack">
          <div className="docs-elevation-stack__card docs-elevation-stack__card--raised"><span className="docs-preview-meta">Resting</span><code>elevation.raised</code><span>Cards and panels</span></div>
          <div className="docs-elevation-stack__card docs-elevation-stack__card--hover"><span className="docs-preview-meta">Hover</span><code>elevation.hover</code><span>Interactive card lift</span></div>
          <div className="docs-elevation-stack__card docs-elevation-stack__card--overlay"><span className="docs-preview-meta">Overlay</span><code>elevation.overlay</code><span>Dialogs and drawers</span></div>
        </div>
      </Panel>
    </>
  );
}

/* ---------- Motion ---------- */

function MotionExample({ reducedMotion, tokens, values }: { readonly reducedMotion: boolean; readonly tokens: readonly FoundationToken[]; readonly values: Readonly<Record<string, string>> }) {
  return (
    <Panel as="section" aria-labelledby="motion-computed-title">
      <SectionHead id="motion-computed-title" title="Computed motion">These values are read from the live CSS custom properties, so reduced motion displays <code>0s</code> rather than the build artifact duration.</SectionHead>
      <dl className="docs-motion-grid">
        {tokens.map((token) => (
          <div key={token.key} className="docs-motion-grid__tile">
            <dt><code>{token.key}</code></dt>
            <dd data-motion-value={token.key}><code>{values[token.key] ?? token.values.dark}</code></dd>
          </div>
        ))}
      </dl>
      <div className="docs-motion-preview">
        <div className="docs-canvas docs-canvas--column">
          <p className="docs-preview-meta">State transitions</p>
          <div className="docs-preview-row"><Button data-motion-target="button" variant="primary">Hover or focus</Button><Switch data-motion-target="switch" aria-label="Selected motion example" defaultChecked /></div>
        </div>
        <div className="docs-canvas docs-canvas--column">
          <p className="docs-preview-meta">Progress alternatives</p>
          <div className="docs-preview-row"><ProgressRing aria-label="Motion example progress" value={64} valueText="64%" /><Spinner label="Loading preview" /></div>
        </div>
      </div>
      <Banner tone="info">{reducedMotion ? "Reduced motion is enabled; final component states remain unchanged." : "Reduced motion is not enabled."}</Banner>
    </Panel>
  );
}

/* ---------- Page ---------- */

const descriptions: Readonly<Record<FoundationGroup, string>> = {
  color: "Dark is the canonical palette; the current theme value is shown.",
  typography: "Seven fixed steps for copy, and responsive ranges for headings derived from the largest step.",
  spacing: "Breakpoints are compiled to media-query literals; CSS custom properties cannot be evaluated in media conditions.",
  elevation: "Radius steps and three shadow levels. Depth is a luminance step first and a soft shadow second.",
  motion: "Motion values reflect the current system reduced-motion preference.",
};

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

  const themed = group === "color" || group === "elevation";

  return (
    <section className="cdt-page docs-foundation" aria-labelledby="foundation-title">
      <div className="docs-page-head">
        <p className="docs-eyebrow">Foundations</p>
        <h1 id="foundation-title">{title}</h1>
        <p className="docs-lead">{descriptions[group]}</p>
        <div className="docs-page-head__meta">
          <Badge tone="accent">{tokens.length} tokens</Badge>
          {themed ? <Badge>Showing {theme} values</Badge> : null}
        </div>
      </div>

      {group === "color" ? <ColorGallery tokens={tokens} theme={theme} /> : null}
      {group === "typography" ? <><TypographyExample /><TypeScale tokens={tokens} theme={theme} /></> : null}
      {group === "spacing" ? <><SpacingRuler tokens={tokens} theme={theme} /><LayoutExamples /></> : null}
      {group === "elevation" ? <ElevationExamples tokens={tokens} theme={theme} /> : null}
      {group === "motion" ? <MotionExample reducedMotion={reducedMotion} tokens={tokens} values={motionValues} /> : null}

      <section className="docs-table-section" aria-labelledby="foundation-table-title">
        <SectionHead id="foundation-table-title" title="Token table">Tier, current value and usage for every token in this group, straight from the generated artifact.</SectionHead>
        <TokenTable tokens={tokens} theme={theme} />
      </section>

      {group === "color" ? <Pointer icon={<Braces size={20} strokeWidth={1.75} aria-hidden="true" />} title="Looking for contrast verdicts?" text="Contrast results and pass or fail decisions for every pair live in the token reference." to="/tokens/reference" cta="Token reference" /> : null}
      {group === "elevation" ? <Pointer icon={<Layers size={20} strokeWidth={1.75} aria-hidden="true" />} title="Stacking order" text="The z-index scale belongs to the token reference, next to the layering diagram." to="/tokens/reference" cta="Token reference" /> : null}
    </section>
  );
}
