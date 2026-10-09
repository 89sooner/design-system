// Refs: CR-042 WP-018 FR-DOC-001 FR-DOC-005 FR-THM-003 W-001
import { Badge, Banner, Button, Card, CardGrid, CodeBlock, CopyButton, Meter, Panel, StatusBadge, Switch, Table, Timeline } from "@conductor-by-89soone/react";
import type { Status } from "@conductor-by-89soone/react";
import { Accessibility, ArrowRight, Braces, CircleCheck, CirclePause, Component, Info, Layers, Loader, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import stats from "./generated/site-stats.json";

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

interface Principle {
  readonly title: ReactNode;
  readonly icon: ReactNode;
  readonly body: ReactNode;
}

const principles: readonly Principle[] = [
  {
    title: "One token source",
    icon: <Braces size={20} strokeWidth={1.75} aria-hidden="true" />,
    body: <>Every colour, length and duration is a <code>--cdt-</code> custom property generated from one TypeScript source. Component tokens reference semantic tokens only, so a theme swaps values and never keys.</>,
  },
  {
    title: <>Cascade layers, never <code>!important</code></>,
    icon: <Layers size={20} strokeWidth={1.75} aria-hidden="true" />,
    body: <>The stylesheet opens with <code>@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility</code>. Unlayered consumer rules win by cascade order, so no override needs <code>!important</code>.</>,
  },
  {
    title: "Accessibility by Radix",
    icon: <Accessibility size={20} strokeWidth={1.75} aria-hidden="true" />,
    body: <>Dialogs, menus, selects and switches delegate focus, roles and keyboard handling to Radix UI. Status is never colour alone: every badge carries an icon and a label.</>,
  },
  {
    title: "Zero runtime requests",
    icon: <ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />,
    body: <>The packages ship static CSS and components that fetch nothing and track nothing. Every colour pair is measured at build time against WCAG 2.1 AA.</>,
  },
];

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
      <div className="docs-hero__install">
        <code>{INSTALL_COMMAND}</code>
        <CopyButton value={INSTALL_COMMAND} label="Copy" />
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
          <li key={tile.label} className="docs-stats__tile">
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
          <Card key={pkg.id} className="docs-package" href={pkg.href} aria-labelledby={`docs-package-${pkg.id}-name docs-package-${pkg.id}-cta`} aria-describedby={`docs-package-${pkg.id}-description`}>
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

function Principles() {
  return (
    <section className="docs-principles" aria-labelledby="principles-title">
      <SectionHead eyebrow="Principles" id="principles-title" title="Settled decisions, not open questions">
        The architecture records are closed; what follows is how the packages behave because of them.
      </SectionHead>
      <div className="docs-principles__grid">
        {principles.map((principle, index) => (
          <Panel key={index} as="section" className="docs-principle">
            <span className="docs-principle__icon">{principle.icon}</span>
            <div className="docs-principle__body">
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </div>
          </Panel>
        ))}
      </div>
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
  return (
    <section className="cdt-page docs-landing" aria-labelledby="overview-title">
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
