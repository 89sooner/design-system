import { AppShell } from "@conductor-by-89soone/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { DocsFooter, DocsTopBar, Navigation, RouteLoading, RouteTransition } from "./shell";
import { applyTheme, persistTheme, PRERENDER_THEME, readTheme, type Theme } from "./theme";
import { Overview } from "./landing";

// 무거운 화면(카탈로그 30개 live preview, 생성 토큰/대비 데이터, 가이드)은 라우트
// 단위로 지연 로드한다. 첫 페인트 청크가 셸만 담아야 NFR-001 LCP p75 2.5초 예산이
// 성립한다 (WP-028).
const CatalogIndex = lazy(() => import("./catalog").then((module) => ({ default: module.CatalogIndex })));
const ComponentDetail = lazy(() => import("./catalog").then((module) => ({ default: module.ComponentDetail })));
const TokenReference = lazy(() => import("./token-reference").then((module) => ({ default: module.TokenReference })));
const Patterns = lazy(() => import("./guides").then((module) => ({ default: module.Patterns })));
const Accessibility = lazy(() => import("./guides").then((module) => ({ default: module.Accessibility })));
const FoundationPage = lazy(() => import("./foundation-page").then((module) => ({ default: module.FoundationPage })));
const GettingStarted = lazy(() => import("./getting-started").then((module) => ({ default: module.GettingStarted })));

const WorkbenchExample = lazy(() => import("./workbench-example").then(module => ({ default: module.WorkbenchExample })));
const RelationExample = lazy(() => import("./relation-example").then(module => ({ default: module.RelationExample })));
const OperationsExample = lazy(() => import("./operations-example").then(module => ({ default: module.OperationsExample })));

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

  // The shell pieces live in `./shell`; this file only wires routes, theme state and the transition.
  return <AppShell className="docs-shell" nav={<Navigation close={() => setNavOpen(false)} />} topBar={<DocsTopBar theme={theme} onToggleTheme={toggleTheme} />} navOpen={navOpen} onNavOpenChange={setNavOpen} skipLinkLabel="Skip to content" mainId="content"><Suspense fallback={<RouteLoading />}><RouteTransition><Routes><Route path="/examples/workbench" element={<WorkbenchExample />} /><Route path="/examples/relations" element={<RelationExample />} /><Route path="/examples/operations" element={<OperationsExample />} /><Route path="/" element={<Overview />} /><Route path="/getting-started" element={<GettingStarted />} /><Route path="/foundations/color" element={<FoundationPage group="color" theme={theme} title="Color" />} /><Route path="/foundations/typography" element={<FoundationPage group="typography" theme={theme} title="Typography" />} /><Route path="/foundations/spacing" element={<FoundationPage group="spacing" theme={theme} title="Spacing & Layout" />} /><Route path="/foundations/elevation" element={<FoundationPage group="elevation" theme={theme} title="Radius & Elevation" />} /><Route path="/foundations/motion" element={<FoundationPage group="motion" theme={theme} title="Motion" />} /><Route path="/components" element={<CatalogIndex />} /><Route path="/components/:componentId" element={<ComponentRoute />} /><Route path="/tokens" element={<Navigate replace to={`/tokens/reference${location.search}`} />} /><Route path="/tokens/reference" element={<TokenRoute />} /><Route path="/patterns" element={<Navigate replace to={`/guidelines${location.search}`} />} /><Route path="/guidelines" element={<Patterns />} /><Route path="/accessibility" element={<AccessibilityRoute />} /><Route path="*" element={<Placeholder title="Not found" />} /></Routes></RouteTransition></Suspense><DocsFooter /></AppShell>;
}
