import { AppShell, Banner, CodeBlock, IconButton, NavList, Panel, Switch, Table, TopBar } from "@conductor/react";
import { Menu, Moon, Sun } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { applyTheme, persistTheme, readTheme, type Theme } from "./theme";

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
  return <section className="cdt-page" aria-labelledby="overview-title"><div><p className="docs-eyebrow">Design system</p><h1 id="overview-title">Conductor Design System</h1><p className="docs-lead">Reusable tokens, CSS, and React primitives for a focused operational interface.</p></div><div className="cdt-card-grid">{[["@conductor/tokens", "Theme-aware tokens and validation."], ["@conductor/css", "Layered, framework-agnostic styles."], ["@conductor/react", "Accessible composable primitives."]].map(([name, description]) => <article className="cdt-card" key={name}><h2>{name}</h2><p className="cdt-muted">{description}</p></article>)}</div></section>;
}

const installCode = "pnpm add @conductor/tokens @conductor/css @conductor/react\npnpm add react react-dom lucide-react\npnpm run build";
const styleCode = 'import "@conductor/css";';
const themeCode = '<html data-cdt-theme="dark">';
const ssrThemeCode = 'try {\n  const saved = localStorage.getItem("conductor-theme");\n  document.documentElement.dataset.cdtTheme = saved === "light" || saved === "dark" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n} catch {\n  document.documentElement.dataset.cdtTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n}';

function GettingStarted() {
  return <section className="cdt-page" aria-labelledby="getting-started-title"><h1 id="getting-started-title">Getting Started</h1><Panel as="section"><h2>Requirements</h2><Table caption="Consumer requirements"><Table.Head><Table.Row><Table.HeaderCell>Requirement</Table.HeaderCell><Table.HeaderCell>Value</Table.HeaderCell></Table.Row></Table.Head><Table.Body>{[["Node", "20 or later"], ["pnpm", "10 or later"], ["React", "18 or 19"]].map(([name, value]) => <Table.Row key={name}><Table.Cell>{name}</Table.Cell><Table.Cell>{value}</Table.Cell></Table.Row>)}</Table.Body></Table></Panel><section><h2>Install</h2><p className="cdt-muted">Use these three commands or fewer in a React application.</p><CodeBlock language="bash" code={installCode} /></section><section><h2>Import the stylesheet</h2><CodeBlock language="ts" code={styleCode} /></section><section><h2>Choose a theme</h2><CodeBlock language="html" code={themeCode} /></section><Panel as="section"><h2>Cascade layers</h2><CodeBlock language="css" code="@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;" /><Banner tone="info">Radix CSS custom properties such as <code>--radix-*</code> are inline runtime values, not Conductor layer rules.</Banner></Panel><Panel as="section"><h2>SSR first paint</h2><CodeBlock language="js" code={ssrThemeCode} /><Banner tone="warning">Place this snippet in <code>&lt;head&gt;</code> before application JavaScript to avoid a theme flash.</Banner></Panel><Panel as="section"><h2>Build order</h2><p className="cdt-mono">tokens → css → react → docs</p></Panel></section>;
}

function Placeholder({ title }: { readonly title: string }) {
  return <section className="cdt-page" aria-labelledby="page-title"><h1 id="page-title">{title}</h1><p className="cdt-muted">This documentation page lands in a following work package.</p></section>;
}

function ComponentRoute() {
  const { componentId } = useParams();
  const location = useLocation();
  return <ComponentDetail name={componentId ?? ""} forceCopyUnavailable={new URLSearchParams(location.search).has("clipboard-unavailable")} />;
}

function TokenRoute() {
  const location = useLocation();
  return <TokenReference forceMissingReport={new URLSearchParams(location.search).has("metrics-unavailable")} />;
}

export function App() {
  const [theme, setTheme] = useState<Theme>(() => readTheme(window));
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => applyTheme(theme, document), [theme]);
  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); persistTheme(next, window); };

  const topBar = <TopBar menuButton={<IconButton aria-label="Open navigation" icon={<Menu />} variant="ghost" onClick={() => setNavOpen(true)} />} title={<Link className="docs-topbar__title" to="/">Conductor</Link>} actions={<div className="docs-theme-toggle">{theme === "dark" ? <Moon aria-hidden="true" size={16} /> : <Sun aria-hidden="true" size={16} />}<span className="cdt-sr-only">Use {theme === "dark" ? "light" : "dark"} theme</span><Switch checked={theme === "light"} onClick={toggleTheme} aria-label="Toggle color theme" /></div>} />;

  return <AppShell className="docs-shell" nav={<Navigation close={() => setNavOpen(false)} />} topBar={topBar} navOpen={navOpen} onNavOpenChange={setNavOpen} skipLinkLabel="Skip to content" mainId="content"><Suspense fallback={<section className="cdt-page" aria-busy="true"><p className="cdt-muted">Loading…</p></section>}><Routes><Route path="/" element={<Overview />} /><Route path="/getting-started" element={<GettingStarted />} /><Route path="/foundations/color" element={<FoundationPage group="color" theme={theme} title="Color" />} /><Route path="/foundations/typography" element={<FoundationPage group="typography" theme={theme} title="Typography" />} /><Route path="/foundations/spacing" element={<FoundationPage group="spacing" theme={theme} title="Spacing & Layout" />} /><Route path="/foundations/elevation" element={<FoundationPage group="elevation" theme={theme} title="Radius & Elevation" />} /><Route path="/foundations/motion" element={<FoundationPage group="motion" theme={theme} title="Motion" />} /><Route path="/components" element={<CatalogIndex />} /><Route path="/components/:componentId" element={<ComponentRoute />} /><Route path="/tokens" element={<TokenRoute />} /><Route path="/tokens/reference" element={<TokenRoute />} /><Route path="/patterns" element={<Patterns />} /><Route path="/guidelines" element={<Patterns />} /><Route path="/accessibility" element={<Accessibility />} /><Route path="*" element={<Placeholder title="Not found" />} /></Routes></Suspense></AppShell>;
}
