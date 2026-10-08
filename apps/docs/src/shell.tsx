// Refs: CR-042 WP-018 WP-023 FR-DOC-001 FR-DOC-005 FR-CMP-009
//
// Everything the documentation shell adds around the routed page: navigation (brand, list,
// quiet external links), the top bar, the route transition, the loading skeleton and the footer.
// Only public `@conductor-by-89soone/react` components and public `cdt-*` classes are composed;
// nothing here touches `document` or `window` at render time, so the landing prerender
// (`scripts/prerender.mjs`) renders the same tree the client hydrates.
import { AppShellNavTrigger, Badge, IconButton, NavList, Switch, TopBar } from "@conductor-by-89soone/react";
import reactPackage from "@conductor-by-89soone/react/package.json";
import {
  Accessibility,
  Activity,
  BookOpen,
  Braces,
  Component,
  ExternalLink,
  GitBranch,
  Github,
  Home,
  LayoutGrid,
  Layers,
  Menu,
  Moon,
  Palette,
  Rocket,
  Search,
  Sparkles,
  Sun,
  Type,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Theme } from "./theme";

export const REPOSITORY_URL = "https://github.com/89sooner/design-system";
export const NPM_ORG_URL = "https://www.npmjs.com/org/conductor-by-89soone";
const NPM_PACKAGE_URL = "https://www.npmjs.com/package/@conductor-by-89soone";

type NavSection = "Start" | "Foundations" | "Reference" | "Guides" | "Workspaces";

export interface DocsNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly section: NavSection;
  readonly icon: ReactNode;
}

const navIconProps = { size: 16, strokeWidth: 1.75 } as const;

export const navItems: readonly DocsNavItem[] = [
  { id: "overview", label: "Overview", href: "/", section: "Start", icon: <Home {...navIconProps} /> },
  { id: "getting-started", label: "Getting Started", href: "/getting-started", section: "Start", icon: <Rocket {...navIconProps} /> },
  { id: "color", label: "Color", href: "/foundations/color", section: "Foundations", icon: <Palette {...navIconProps} /> },
  { id: "typography", label: "Typography", href: "/foundations/typography", section: "Foundations", icon: <Type {...navIconProps} /> },
  { id: "spacing", label: "Spacing & Layout", href: "/foundations/spacing", section: "Foundations", icon: <LayoutGrid {...navIconProps} /> },
  { id: "elevation", label: "Radius & Elevation", href: "/foundations/elevation", section: "Foundations", icon: <Layers {...navIconProps} /> },
  { id: "motion", label: "Motion", href: "/foundations/motion", section: "Foundations", icon: <Sparkles {...navIconProps} /> },
  { id: "components", label: "Components", href: "/components", section: "Reference", icon: <Component {...navIconProps} /> },
  { id: "tokens", label: "Tokens", href: "/tokens/reference", section: "Reference", icon: <Braces {...navIconProps} /> },
  { id: "guidelines", label: "Guidelines", href: "/guidelines", section: "Guides", icon: <BookOpen {...navIconProps} /> },
  { id: "accessibility", label: "Accessibility", href: "/accessibility", section: "Guides", icon: <Accessibility {...navIconProps} /> },
  { id: "workbench", label: "검색 워크벤치", href: "/examples/workbench", section: "Workspaces", icon: <Search {...navIconProps} /> },
  { id: "relations", label: "관계 탐색기", href: "/examples/relations", section: "Workspaces", icon: <GitBranch {...navIconProps} /> },
  { id: "operations", label: "수집 운영 상태", href: "/examples/operations", section: "Workspaces", icon: <Activity {...navIconProps} /> },
];

/** Sections whose name belongs in the top-bar title ("Foundations · Color"); the rest read as the label alone. */
const groupedSections: ReadonlySet<NavSection> = new Set<NavSection>(["Foundations", "Workspaces"]);

/** Legacy paths redirect in `App.tsx` (DEV-026); the title names the destination during that frame. */
const legacyPaths: Readonly<Record<string, string>> = { "/tokens": "/tokens/reference", "/patterns": "/guidelines" };

function isActive(href: string, pathname: string): boolean {
  return pathname === href || (href === "/components" && pathname.startsWith("/components/"));
}

/** The section label the top bar shows for a route: "Overview", "Foundations · Color", "Components · Button". */
export function sectionTitleFor(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/components/")) {
    const rawId = path.slice("/components/".length);
    let id = rawId;
    try {
      id = decodeURIComponent(rawId);
    } catch {
      // A malformed escape sequence still names a route; show it as typed.
    }
    return id === "" ? "Components" : `Components · ${id}`;
  }
  const resolved = legacyPaths[path] ?? path;
  const item = navItems.find((entry) => entry.href === resolved);
  if (item === undefined) return "Not found";
  return groupedSections.has(item.section) ? `${item.section} · ${item.label}` : item.label;
}

/**
 * The Conductor mark: a "C" arc closing on a single point, drawn on an accent tile. Pure
 * presentation, so it is hidden from assistive technology and always sits beside text.
 */
export function BrandMark({ className }: { readonly className?: string }) {
  return (
    <svg className={className === undefined ? "docs-brand-mark" : `docs-brand-mark ${className}`} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect className="docs-brand-mark__tile" width="28" height="28" rx="8" />
      <path className="docs-brand-mark__arc" d="M19.9 10.2a7 7 0 1 0 0 7.6" />
      <circle className="docs-brand-mark__point" cx="19.9" cy="14" r="1.7" />
    </svg>
  );
}

export function Navigation({ close }: { readonly close?: () => void }) {
  const location = useLocation();
  const items = navItems.map((item) => ({ ...item, active: isActive(item.href, location.pathname) }));
  return (
    <>
      <Link className="docs-nav__brand" to="/" onClick={close}>
        <BrandMark />
        <span className="docs-nav__wordmark">Conductor</span>
        {" "}
        <Badge className="docs-nav__version">{`v${reactPackage.version}`}</Badge>
      </Link>
      <NavList items={items} aria-label="Documentation" renderLink={(item, props) => <Link {...props} to={item.href} onClick={close} />} />
      <div className="docs-nav__footer">
        <a className="docs-nav__footer-link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
          GitHub
          <ExternalLink aria-hidden="true" size={12} strokeWidth={1.75} />
        </a>
        <a className="docs-nav__footer-link" href={NPM_ORG_URL} target="_blank" rel="noreferrer">
          npm
          <ExternalLink aria-hidden="true" size={12} strokeWidth={1.75} />
        </a>
      </div>
    </>
  );
}

export interface DocsTopBarProps {
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
}

export function DocsTopBar({ theme, onToggleTheme }: DocsTopBarProps) {
  const location = useLocation();
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <TopBar
      className="docs-topbar"
      menuButton={
        <>
          <AppShellNavTrigger asChild>
            <IconButton aria-label="Open navigation" icon={<Menu />} variant="ghost" />
          </AppShellNavTrigger>
          {/* Below `breakpoint.sm` the TopBar hides its context column, so the brand rides along with the menu button. */}
          <Link className="docs-topbar__brand" to="/">
            <BrandMark />
            Conductor
          </Link>
        </>
      }
      eyebrow="Conductor"
      title={<span className="docs-topbar__section">{sectionTitleFor(location.pathname)}</span>}
      actions={
        <>
          <a className="cdt-btn cdt-btn--ghost cdt-btn--tone-neutral cdt-btn--icon docs-topbar__github" href={REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository">
            <span aria-hidden="true"><Github size={16} strokeWidth={1.75} /></span>
          </a>
          <div className="docs-theme-toggle">
            {theme === "dark" ? <Moon aria-hidden="true" size={16} strokeWidth={1.75} /> : <Sun aria-hidden="true" size={16} strokeWidth={1.75} />}
            <Switch checked={theme === "light"} onCheckedChange={onToggleTheme} aria-label={`Use ${next} theme`} />
          </div>
        </>
      }
    />
  );
}

/** Remounts the routed page per pathname so the entrance animation in `shell.css` plays once per screen. */
export function RouteTransition({ children }: { readonly children: ReactNode }) {
  const location = useLocation();
  return <div className="docs-route" key={location.pathname}>{children}</div>;
}

/** Suspense fallback while a route chunk loads: a quiet eyebrow / title / lead skeleton, no motion. */
export function RouteLoading() {
  return (
    <section className="cdt-page docs-route-loading" aria-busy="true">
      <p className="cdt-sr-only">Loading…</p>
      <div className="docs-route-loading__bar docs-route-loading__bar--eyebrow" />
      <div className="docs-route-loading__bar docs-route-loading__bar--title" />
      <div className="docs-route-loading__bar docs-route-loading__bar--lead" />
    </section>
  );
}

const footerPackages = ["tokens", "css", "react"] as const;

const footerDocs: readonly (readonly [label: string, href: string])[] = [
  ["Getting Started", "/getting-started"],
  ["Components", "/components"],
  ["Tokens", "/tokens/reference"],
  ["Accessibility", "/accessibility"],
];

export function DocsFooter() {
  return (
    <footer className="docs-footer">
      <div className="docs-footer__brand">
        <div className="docs-footer__identity">
          <BrandMark />
          <span>Conductor Design System</span>
        </div>
        <p className="docs-footer__note">Built with the public <span className="docs-footer__scope">@conductor-by-89soone</span> packages. No runtime requests, no telemetry.</p>
        <p className="docs-footer__license">MIT License</p>
      </div>
      <div className="docs-footer__column docs-footer__column--packages">
        <p className="docs-footer__heading" id="docs-footer-packages">Packages</p>
        <ul className="docs-footer__list" aria-labelledby="docs-footer-packages">
          {footerPackages.map((name) => (
            <li key={name}>
              <a className="docs-footer__link" href={`${NPM_PACKAGE_URL}/${name}`} target="_blank" rel="noreferrer">
                <span className="docs-footer__package">@conductor-by-89soone/{name}</span>
                <ExternalLink aria-hidden="true" size={12} strokeWidth={1.75} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="docs-footer__column docs-footer__column--docs">
        <p className="docs-footer__heading" id="docs-footer-docs">Docs</p>
        <ul className="docs-footer__list" aria-labelledby="docs-footer-docs">
          {footerDocs.map(([label, href]) => (
            <li key={href}>
              <Link className="docs-footer__link" to={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
