// Refs: CR-042 CR-049 WP-018 FR-DOC-001 FR-DOC-005 FR-THM-003 W-001
import { Badge, Banner, Button, Card, CardGrid, CodeBlock, CopyButton, Kbd, Meter, Panel, StatusBadge, Switch, Table, Timeline } from "@conductor-by-89soone/react";
import type { Status } from "@conductor-by-89soone/react";
import { Accessibility, ArrowRight, Bot, Braces, CircleCheck, CirclePause, Component, Info, Layers, Loader, Palette, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import stats from "./generated/site-stats.json";
import { trackSpotlight } from "./pointer-spotlight";

/*
 * W-001 is the only route `scripts/prerender.mjs` renders in Node, so nothing here may touch
 * `document`, `navigator` or `requestAnimationFrame` during render, and every piece of local
 * state starts from the same value on the server and on the hydrating client. Colour never
 * branches on the theme in JSX: it all arrives through `--cdt-*` custom properties.
 *
 * The page is also the LCP route (NFR-001), so the markup stays lean: no wrapper that carries
 * no style, three table rows, and arrows after card footers come from CSS rather than an SVG each.
 */

const INSTALL_COMMAND = "pnpm add @conductor-by-89soone/react";
const REACT_PACKAGE = "@conductor-by-89soone/react";

interface Deployment {
  readonly service: string;
  readonly status: Status;
  readonly label: string;
  readonly icon: ReactNode;
  readonly duration: string;
}

const deployments: readonly Deployment[] = [
  { service: "web-console", status: "running", label: "Deploying", icon: <Loader size={12} aria-hidden="true" />, duration: "1m 12s" },
  { service: "event-worker", status: "success", label: "Healthy", icon: <CircleCheck size={12} aria-hidden="true" />, duration: "42s" },
  { service: "search-index", status: "waiting", label: "Awaiting approval", icon: <CirclePause size={12} aria-hidden="true" />, duration: "18s" },
];

interface ReleaseStep {
  readonly title: string;
  readonly detail: string;
  readonly selected?: boolean;
}

const releaseSteps: readonly ReleaseStep[] = [
  { title: "Validated", detail: "All 14 checks passed" },
  { title: "Deploying", detail: "Rolling out to the canary group", selected: true },
  { title: "Traffic shift", detail: "Starts once the rollout settles" },
];

interface StatTile {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

const statTiles: readonly StatTile[] = [
  { value: String(stats.components), label: "Components", detail: "Radix-based React primitives" },
  { value: String(stats.tokens), label: "Tokens", detail: "One source, both palettes" },
  { value: `${stats.contrastPassed}/${stats.contrastChecks}`, label: "Contrast checks", detail: "WCAG 2.1 AA, measured per theme" },
  { value: String(stats.themes), label: "Themes", detail: "0 runtime requests" },
];

type PackageId = "tokens" | "css" | "react";

interface PackageCard {
  readonly id: PackageId;
  readonly name: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
  readonly icon: ReactNode;
}

const packages: readonly PackageCard[] = [
  {
    id: "tokens",
    name: "@conductor-by-89soone/tokens",
    description: "The token source with its build and contrast CLIs. Emits CSS custom properties and typed keys for both themes.",
    href: "#/tokens/reference",
    cta: "Tokens reference",
    icon: <Palette size={20} strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: "css",
    name: "@conductor-by-89soone/css",
    description: "A framework-agnostic stylesheet organised in cdt.* cascade layers. Works with any markup that uses the class contract.",
    href: "#/getting-started",
    cta: "Getting started",
    icon: <Layers size={20} strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: "react",
    name: REACT_PACKAGE,
    description: "Radix-based primitives that compose the stylesheet. Focus, roles and keyboard handling are delegated, never hand-rolled.",
    href: "#/components",
    cta: "Browse components",
    icon: <Component size={20} strokeWidth={1.75} aria-hidden="true" />,
  },
];

const previewChips = ["running", "success", "waiting", "partial", "danger"] as const;

function PackagePreview({ id }: { readonly id: PackageId }) {
  if (id === "tokens") {
    return (
      <div className="docs-package__preview docs-package__preview--chips" aria-hidden="true">
        {previewChips.map((status) => <span key={status} className={`docs-package__chip docs-package__chip--${status}`} />)}
      </div>
    );
  }
  if (id === "css") {
    return (
      <div className="docs-package__preview docs-package__preview--layers" aria-hidden="true">
        <span className="docs-package__layer">cdt.reset</span>
        <span className="docs-package__layer">cdt.base</span>
        <span className="docs-package__layer">cdt.component</span>
      </div>
    );
  }
  return (
    <div className="docs-package__preview docs-package__preview--badges" aria-hidden="true">
      <span className="cdt-badge cdt-badge--accent">Dialog</span>
      <span className="cdt-badge cdt-badge--success">Switch</span>
      <span className="cdt-badge cdt-badge--neutral">Table</span>
    </div>
  );
}

interface QuickStep {
  readonly number: string;
  readonly title: string;
  readonly note: string;
  readonly language: string;
  readonly code: string;
}

const quickSteps: readonly QuickStep[] = [
  { number: "01", title: "Install the package", note: "The full guide lists the tokens and stylesheet packages alongside it.", language: "bash", code: INSTALL_COMMAND },
  { number: "02", title: "Import the stylesheet once", note: "Its first line declares the cascade layers, so your own rules always win.", language: "ts", code: 'import "@conductor-by-89soone/css";' },
  { number: "03", title: "Render a component", note: "Every variant reads the current theme from the html attribute.", language: "tsx", code: '<Button variant="primary">Save</Button>' },
];

function LandingActions({ className }: { readonly className: string }) {
  return (
    <div className={className}>
      <Link className="cdt-btn cdt-btn--primary cdt-btn--tone-accent" to="/getting-started">
        Get started
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </Link>
      <Link className="cdt-btn cdt-btn--secondary cdt-btn--tone-neutral" to="/components">Browse components</Link>
    </div>
  );
}

function SectionHead({ eyebrow, id, title, children }: { readonly eyebrow: string; readonly id: string; readonly title: string; readonly children?: ReactNode }) {
  return (
    <div className="docs-landing__head">
      <p className="docs-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {children === undefined ? null : <p className="docs-landing__sub">{children}</p>}
    </div>
  );
}

function Hero() {
  return (
    <div className="docs-hero">
      <Badge className="docs-hero__pill" tone="accent" icon={<Sparkles size={12} aria-hidden="true" />}>Dark-first · tokens → css → react</Badge>
      <h1 id="overview-title" className="docs-hero__title"><span className="docs-hero__gradient">Conductor</span> Design System</h1>
      <p className="docs-hero__lead">Reusable tokens, a layered stylesheet and Radix-based React primitives for focused operational interfaces. Dark is canonical, light is a first-class second palette, and every colour ships with its contrast verdict.</p>
      <LandingActions className="docs-hero__actions" />
      <HeroCode />
    </div>
  );
}

const HERO_SNIPPET = 'import "@conductor-by-89soone/css";\nimport { Button } from "@conductor-by-89soone/react";\n\n<Button variant="primary">Deploy</Button>';

/*
 * The hero leads with the code a consumer writes (CR-049). Highlighting is three hand-placed spans,
 * not a tokenizer, and every colour is a contrast-checked pair on `surface.raised`: accent 4.82:1 /
 * 5.39:1, status.success 6.68:1 / 5.34:1, text.muted and text.monoPayload above both. The h1 stays
 * the largest text node, so the LCP candidate does not move.
 */
function HeroCode() {
  const pkg = (name: string) => <span className="docs-code__string">"@conductor-by-89soone/{name}"</span>;
  return (
    <div className="docs-hero__code">
      <div className="docs-hero__code-bar">
        <span className="docs-hero__code-dots" aria-hidden="true"><span /><span /><span /></span>
        <span className="docs-hero__code-file">app.tsx</span>
        <CopyButton value={HERO_SNIPPET} label="Copy code" />
      </div>
      <pre className="docs-hero__code-body" aria-label="Example: import the stylesheet once and render a Button"><code>
        <span className="docs-code__keyword">import</span> {pkg("css")};{"\n"}
        <span className="docs-code__keyword">import</span> {"{ Button }"} <span className="docs-code__keyword">from</span> {pkg("react")};{"\n\n"}
        <span className="docs-code__punct">{"<"}</span>Button <span className="docs-code__attr">variant</span><span className="docs-code__punct">=</span><span className="docs-code__string">"primary"</span><span className="docs-code__punct">{">"}</span>Deploy<span className="docs-code__punct">{"</"}</span>Button<span className="docs-code__punct">{">"}</span>
      </code></pre>
      <div className="docs-hero__code-cmd">
        <span className="docs-hero__code-prompt" aria-hidden="true">$</span>
        <code>{INSTALL_COMMAND}</code>
        <CopyButton value={INSTALL_COMMAND} label="Copy command" />
      </div>
    </div>
  );
}

function Showcase() {
  // Harmless local state: it starts checked on the server and on the client alike.
  const [autoPromote, setAutoPromote] = useState(true);
  return (
    <section className="docs-showcase" aria-labelledby="showcase-title">
      <h2 id="showcase-title" className="cdt-sr-only">Live showcase</h2>
      <div className="docs-showcase__panel">
        <div className="docs-showcase__header">
          <Badge tone="accent">web-console</Badge>
          <StatusBadge status="running" icon={<Loader size={12} aria-hidden="true" />} label="Deploying" />
        </div>
        <div className="docs-showcase__body">
          <div className="docs-showcase__stack">
            <Table aria-label="Recent deployments">
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Service</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Duration</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {deployments.map((row) => (
                  <Table.Row key={row.service}>
                    <Table.Cell><strong>{row.service}</strong></Table.Cell>
                    <Table.Cell><StatusBadge status={row.status} icon={row.icon} label={row.label} /></Table.Cell>
                    <Table.Cell numeric>{row.duration}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <Panel size="sm" className="docs-showcase__rollout">
              <span className="docs-showcase__rollout-head"><strong>Rollout</strong><span>canary · warns at 80%</span></span>
              <Meter aria-label="Rollout progress" value={72} warningAt={80} valueText="72%" />
            </Panel>
            <Banner tone="info" icon={<Info size={16} strokeWidth={1.75} aria-hidden="true" />} title={autoPromote ? "Auto-promote is on" : "Auto-promote is off"}>
              {autoPromote ? "The release moves to 100% once the canary stays healthy for 15 minutes." : "Promote the release by hand once every check has passed."}
            </Banner>
          </div>
          <Card className="docs-console">
            <Timeline aria-label="Release steps">
              {releaseSteps.map((step) => (
                <Timeline.Step key={step.title} selected={step.selected === true}>
                  <div className="docs-console__step">
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                  </div>
                </Timeline.Step>
              ))}
            </Timeline>
            <div className="docs-setting-row">
              <div>
                <strong id="docs-console-auto-promote">Auto-promote</strong>
                <span>Promote when every check passes</span>
              </div>
              <Switch aria-labelledby="docs-console-auto-promote" checked={autoPromote} onCheckedChange={setAutoPromote} />
            </div>
            <div className="docs-console__actions">
              <Button variant="primary" tone="accent">Promote release</Button>
              <Button variant="ghost">View checks</Button>
            </div>
          </Card>
        </div>
      </div>
      <p className="docs-showcase__caption">Everything above is live DOM from <code>{REACT_PACKAGE}</code> — switch the theme to see the tokens swap.</p>
    </section>
  );
}

function Stats() {
  return (
    <section className="docs-stats" aria-label="Conductor in numbers">
      {/* `list-style: none` drops list semantics in WebKit; the explicit role keeps them. */}
      <ul className="docs-stats__grid" role="list">
        {statTiles.map((tile) => (
          <li key={tile.label} className="docs-stats__tile docs-spotlight" onPointerMove={trackSpotlight}>
            <strong className="docs-stats__value">{tile.value}</strong>
            <span className="docs-stats__label">{tile.label}</span>
            <span className="docs-stats__detail">{tile.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Packages() {
  return (
    <section className="docs-packages" aria-labelledby="packages-title">
      <SectionHead eyebrow="Packages" id="packages-title" title="Three packages, one visual contract">
        Dependencies flow one way, tokens → css → react, and the docs site you are reading is the first consumer.
      </SectionHead>
      <CardGrid className="docs-packages__grid">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="docs-package docs-spotlight" onPointerMove={trackSpotlight} href={pkg.href} aria-labelledby={`docs-package-${pkg.id}-name docs-package-${pkg.id}-cta`} aria-describedby={`docs-package-${pkg.id}-description`}>
            <span className="docs-package__icon">{pkg.icon}</span>
            <span id={`docs-package-${pkg.id}-name`} className="docs-package__name">{pkg.name}</span>
            <span id={`docs-package-${pkg.id}-description`} className="docs-package__description">{pkg.description}</span>
            <PackagePreview id={pkg.id} />
            <span id={`docs-package-${pkg.id}-cta`} className="docs-package__footer">{pkg.cta}</span>
          </Card>
        ))}
      </CardGrid>
    </section>
  );
}

/** Static agent-readable files next to the site (FR-DOC-008); plain anchors, not router links. */
const agentFile = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const KEYBOARD_ROWS: readonly (readonly [keys: readonly string[], action: string])[] = [
  [["Tab"], "Next control"],
  [["Shift", "Tab"], "Previous control"],
  [["Enter"], "Activate"],
  [["Esc"], "Close an overlay"],
  [["↑", "↓"], "Move in menus and lists"],
];

/*
 * W-001 bento (CR-049): the settled decisions as tiles of different weight. Every claim is one the
 * packages enforce — token-only styling (lint:tokens), cascade layers, Radix keyboard behaviour,
 * reduced motion, zero runtime requests and the generated agent docs.
 */
function Principles() {
  return (
    <section className="docs-principles" aria-labelledby="principles-title">
      <SectionHead eyebrow="Principles" id="principles-title" title="Settled decisions, not open questions">
        The architecture records are closed; what follows is how the packages behave because of them.
      </SectionHead>
      <ul className="docs-bento" role="list">
        <li className="docs-bento__tile docs-bento__tile--tokens docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><Braces size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>One token source</h3>
          <p>Every colour, length and duration is a <code>--cdt-</code> custom property generated from one TypeScript source. A theme swaps values, never keys.</p>
          <div className="docs-bento__swatches" aria-hidden="true">
            {previewChips.map((status) => <span key={status} className="docs-bento__swatch"><span className={`docs-package__chip docs-package__chip--${status}`} /><code>status.{status}</code></span>)}
          </div>
        </li>
        <li className="docs-bento__tile docs-bento__tile--keys docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><Accessibility size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>Keyboard-first, by Radix</h3>
          <p>Dialogs, menus, selects and tabs delegate focus, roles and keys to Radix UI. Status is never colour alone.</p>
          <dl className="docs-bento__keys">
            {KEYBOARD_ROWS.map(([keys, action]) => <div key={action}><dt>{keys.map((key) => <Kbd key={key}>{key}</Kbd>)}</dt><dd>{action}</dd></div>)}
          </dl>
        </li>
        <li className="docs-bento__tile docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><Layers size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>Cascade layers, never <code>!important</code></h3>
          <p>Unlayered consumer rules win by layer order.</p>
          <code className="docs-bento__snippet">@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;</code>
        </li>
        <li className="docs-bento__tile docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><Waves size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>Motion that steps aside</h3>
          <p>Entrances settle on a spring, exits accelerate away, and <code>prefers-reduced-motion</code> turns every motion token to <code>0s</code>.</p>
        </li>
        <li className="docs-bento__tile docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>Zero runtime requests</h3>
          <p>Static CSS and components that fetch nothing and track nothing; {stats.contrastPassed} of {stats.contrastChecks} colour pairs pass WCAG 2.1 AA at build time.</p>
        </li>
        <li className="docs-bento__tile docs-bento__tile--agents docs-spotlight" onPointerMove={trackSpotlight}>
          <span className="docs-principle__icon"><Bot size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <h3>Ready for AI agents</h3>
          <p>The build writes a <strong>DESIGN.md</strong> with every token per theme, an <strong>llms.txt</strong> index and a Markdown page per component, all from the same sources as these pages.</p>
          <p className="docs-bento__links"><a href={agentFile("DESIGN.md")}>DESIGN.md</a><a href={agentFile("llms.txt")}>llms.txt</a></p>
        </li>
      </ul>
    </section>
  );
}

function Steps() {
  return (
    <section className="docs-steps" aria-labelledby="steps-title">
      <SectionHead eyebrow="Quick start" id="steps-title" title="Up and running in three steps">
        One command, one import, one component. The rest is reading the current theme.
      </SectionHead>
      <ol className="docs-steps__list" role="list">
        {quickSteps.map((step) => (
          <li key={step.number} className="docs-step">
            <span className="docs-step__number" aria-hidden="true">{step.number}</span>
            <div className="docs-step__text">
              <h3>{step.title}</h3>
              <p className="docs-step__note">{step.note}</p>
            </div>
            <CodeBlock className="docs-step__code" language={step.language} code={step.code} aria-label={`Step ${step.number} code`} />
          </li>
        ))}
      </ol>
      <Link className="docs-steps__link" to="/getting-started">Read the full guide</Link>
    </section>
  );
}

function NextSteps() {
  return (
    <section className="docs-cta" aria-labelledby="cta-title">
      <div className="docs-cta__body">
        <h2 id="cta-title">Ready to build with Conductor?</h2>
        <p>Install the package, import the stylesheet once, and every component picks up the current theme.</p>
      </div>
      <LandingActions className="docs-cta__actions" />
    </section>
  );
}

export function Overview() {
  // Arms the scroll-linked section rise one frame after hydration, never in the prerendered first
  // paint (landing.css explains the LCP cost). The attribute is written straight to the element, not
  // through state, so arming re-renders nothing; the server markup never carries it.
  const landing = useRef<HTMLElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (landing.current !== null) landing.current.dataset.scrollReveal = ""; });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <section ref={landing} className="cdt-page docs-landing" aria-labelledby="overview-title">
      <Hero />
      <Showcase />
      <Stats />
      <Packages />
      <Principles />
      <Steps />
      <NextSteps />
    </section>
  );
}
