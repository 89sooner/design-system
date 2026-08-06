import { AppShell, Banner, CodeBlock, IconButton, NavList, Panel, Switch, Table, TopBar } from "@conductor-by-89soone/react";
import { Menu, Moon, Sun } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { applyTheme, persistTheme, PRERENDER_THEME, readTheme, type Theme } from "./theme";

// 무거운 화면(카탈로그 30개 live preview, 생성 토큰/대비 데이터, 가이드)은 라우트
// 단위로 지연 로드한다. 첫 페인트 청크가 셸만 담아야 NFR-001 LCP p75 2.5초 예산이
// 성립한다 (WP-028).
const CatalogIndex = lazy(() => import("./catalog").then((module) => ({ default: module.CatalogIndex })));
const ComponentDetail = lazy(() => import("./catalog").then((module) => ({ default: module.ComponentDetail })));
const TokenReference = lazy(() => import("./token-reference").then((module) => ({ default: module.TokenReference })));
const Patterns = lazy(() => import("./guides").then((module) => ({ default: module.Patterns })));
const Accessibility = lazy(() => import("./guides").then((module) => ({ default: module.Accessibility })));
const FoundationPage = lazy(() => import("./foundation-page").then((module) => ({ default: module.FoundationPage })));

const navItems = [
  { id: "overview", label: "Overview", href: "/", section: "Start" },
  { id: "getting-started", label: "Getting Started", href: "/getting-started", section: "Start" },
  { id: "color", label: "Color", href: "/foundations/color", section: "Foundations" },
  { id: "typography", label: "Typography", href: "/foundations/typography", section: "Foundations" },
  { id: "spacing", label: "Spacing & Layout", href: "/foundations/spacing", section: "Foundations" },
  { id: "elevation", label: "Radius & Elevation", href: "/foundations/elevation", section: "Foundations" },
  { id: "motion", label: "Motion", href: "/foundations/motion", section: "Foundations" },
  { id: "components", label: "Components", href: "/components", section: "Reference" },
  { id: "tokens", label: "Tokens", href: "/tokens/reference", section: "Reference" },
  { id: "guidelines", label: "Guidelines", href: "/guidelines", section: "Guides" },
  { id: "accessibility", label: "Accessibility", href: "/accessibility", section: "Guides" },
] as const;

function Navigation({ close }: { readonly close?: () => void }) {
  const location = useLocation();
  const items = navItems.map((item) => ({
    ...item,
    active: location.pathname === item.href || (item.href === "/components" && location.pathname.startsWith("/components/")),
  }));
  return <><Link className="docs-nav__brand" to="/" onClick={close}>Conductor</Link><NavList items={items} aria-label="Documentation" renderLink={(item, props) => <Link {...props} to={item.href} onClick={close} />} /></>;
}

function Overview() {
  return <section className="cdt-page" aria-labelledby="overview-title"><div><p className="docs-eyebrow">Design system</p><h1 id="overview-title">Conductor Design System</h1><p className="docs-lead">Reusable tokens, CSS, and React primitives for a focused operational interface.</p></div><div className="cdt-card-grid">{[["@conductor-by-89soone/tokens", "Theme-aware tokens and validation."], ["@conductor-by-89soone/css", "Layered, framework-agnostic styles."], ["@conductor-by-89soone/react", "Accessible composable primitives."]].map(([name, description]) => <article className="cdt-card" key={name}><h2>{name}</h2><p className="cdt-muted">{description}</p></article>)}</div></section>;
}

const installCode = "pnpm add @conductor-by-89soone/tokens @conductor-by-89soone/css @conductor-by-89soone/react\npnpm add react react-dom lucide-react\npnpm run build";
const styleCode = 'import "@conductor-by-89soone/css";';
const themeCode = '<html data-cdt-theme="dark">';
const renderCode = 'import { Button } from "@conductor-by-89soone/react";\n\nexport function SaveAction() {\n  return <Button variant="primary">Save changes</Button>;\n}';
const ssrThemeCode = 'try {\n  const saved = localStorage.getItem("conductor-theme");\n  document.documentElement.dataset.cdtTheme = saved === "light" || saved === "dark" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n} catch {\n  document.documentElement.dataset.cdtTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n}';

function GettingStarted() {
  return <section className="cdt-page" aria-labelledby="getting-started-title"><h1 id="getting-started-title">Getting Started</h1><Panel as="section"><h2>Requirements</h2><Table caption="Consumer requirements"><Table.Head><Table.Row><Table.HeaderCell>Requirement</Table.HeaderCell><Table.HeaderCell>Value</Table.HeaderCell></Table.Row></Table.Head><Table.Body>{[["Node", "20 or later"], ["pnpm", "10 or later"], ["React", "18 or 19"]].map(([name, value]) => <Table.Row key={name}><Table.Cell>{name}</Table.Cell><Table.Cell>{value}</Table.Cell></Table.Row>)}</Table.Body></Table></Panel><section><h2>Install</h2><p className="cdt-muted">Use these three commands or fewer in a React application.</p><CodeBlock language="bash" code={installCode} /></section><section><h2>Import the stylesheet</h2><CodeBlock language="ts" code={styleCode} /><Banner tone="warning">If this import is missing, development builds warn once in the console and components render without Conductor styles.</Banner></section><section><h2>Choose a theme</h2><CodeBlock language="html" code={themeCode} /></section><section><h2>Render a component</h2><CodeBlock language="tsx" code={renderCode} /></section><Panel as="section"><h2>Cascade layers</h2><p>The generated stylesheet fixes this declaration as its first line.</p><CodeBlock language="css" code="@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;" /><Banner tone="info">Radix CSS custom properties such as <code>--radix-*</code> are inline runtime values, not Conductor layer rules.</Banner></Panel><Panel as="section"><h2>SSR first paint</h2><p>Components avoid browser globals during server rendering. Run this browser-only snippet in the document head before hydration so the first paint uses the intended theme.</p><CodeBlock language="js" code={ssrThemeCode} /><Banner tone="warning">Place this snippet in <code>&lt;head&gt;</code> before application JavaScript to avoid a theme flash.</Banner></Panel><Panel as="section"><h2>Build order</h2><p className="cdt-mono">tokens → css → react → docs</p></Panel></section>;
}

function Placeholder({ title }: { readonly title: string }) {
  return <section className="cdt-page" aria-labelledby="page-title"><h1 id="page-title">{title}</h1><p className="cdt-muted">This documentation page lands in a following work package.</p></section>;
}

function ComponentRoute() {
  const { componentId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return <ComponentDetail name={componentId ?? ""} forceCopyUnavailable={params.has("clipboard-unavailable")} forcePreviewError={params.has("preview-error")} />;
}

function TokenRoute() {
  const location = useLocation();
  return <TokenReference forceMissingReport={new URLSearchParams(location.search).has("metrics-unavailable")} />;
}

function AccessibilityRoute() {
  const location = useLocation();
  return <Accessibility forceMissingReport={new URLSearchParams(location.search).has("metrics-unavailable")} />;
}

export interface AppProps {
  /** Theme the first render draws with. `main.tsx` decides it; SSR keeps the prerender default. */
  readonly initialTheme?: Theme;
}

export function App({ initialTheme = PRERENDER_THEME }: AppProps = {}) {
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [navOpen, setNavOpen] = useState(false);
  const mounted = useRef(false);

  // Reconciles the hydrating render, which had to start from the prerender's theme, and re-applies
  // the attribute so the app is still themed if the head snippet never ran.
  useEffect(() => {
    const next = readTheme(window);
    setTheme(next);
    applyTheme(next, document);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    // Focus moves on navigation only. On first load it belongs to the document, and stealing it
    // would skip past the page title a screen reader is about to announce.
    // `preventScroll` matters: `<main>` starts under the sticky top bar, so the default
    // scroll-into-view would immediately undo the reset above.
    if (mounted.current) document.getElementById("content")?.focus({ preventScroll: true });
    mounted.current = true;
  }, [location.pathname]);

  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); applyTheme(next, document); persistTheme(next, window); };

  const topBar = <TopBar menuButton={<IconButton aria-label="Open navigation" icon={<Menu />} variant="ghost" onClick={() => setNavOpen(true)} />} title={<Link className="docs-topbar__title" to="/">Conductor</Link>} actions={<div className="docs-theme-toggle">{theme === "dark" ? <Moon aria-hidden="true" size={16} /> : <Sun aria-hidden="true" size={16} />}<Switch checked={theme === "light"} onCheckedChange={toggleTheme} aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`} /></div>} />;

  return <AppShell className="docs-shell" nav={<Navigation close={() => setNavOpen(false)} />} topBar={topBar} navOpen={navOpen} onNavOpenChange={setNavOpen} skipLinkLabel="Skip to content" mainId="content"><Suspense fallback={<section className="cdt-page" aria-busy="true"><p className="cdt-muted">Loading…</p></section>}><Routes><Route path="/" element={<Overview />} /><Route path="/getting-started" element={<GettingStarted />} /><Route path="/foundations/color" element={<FoundationPage group="color" theme={theme} title="Color" />} /><Route path="/foundations/typography" element={<FoundationPage group="typography" theme={theme} title="Typography" />} /><Route path="/foundations/spacing" element={<FoundationPage group="spacing" theme={theme} title="Spacing & Layout" />} /><Route path="/foundations/elevation" element={<FoundationPage group="elevation" theme={theme} title="Radius & Elevation" />} /><Route path="/foundations/motion" element={<FoundationPage group="motion" theme={theme} title="Motion" />} /><Route path="/components" element={<CatalogIndex />} /><Route path="/components/:componentId" element={<ComponentRoute />} /><Route path="/tokens" element={<Navigate replace to={`/tokens/reference${location.search}`} />} /><Route path="/tokens/reference" element={<TokenRoute />} /><Route path="/patterns" element={<Navigate replace to={`/guidelines${location.search}`} />} /><Route path="/guidelines" element={<Patterns />} /><Route path="/accessibility" element={<AccessibilityRoute />} /><Route path="*" element={<Placeholder title="Not found" />} /></Routes></Suspense></AppShell>;
}
