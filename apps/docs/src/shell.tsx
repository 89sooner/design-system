// Refs: CR-042 WP-018 WP-023 FR-DOC-001 FR-DOC-005 FR-CMP-009
import { NavList } from "@conductor-by-89soone/react";
import { Link, useLocation } from "react-router-dom";

export const navItems = [
  { id: "workbench", label: "검색 워크벤치", href: "/examples/workbench", section: "Workspaces" },
  { id: "relations", label: "관계 탐색기", href: "/examples/relations", section: "Workspaces" },
  { id: "operations", label: "수집 운영 상태", href: "/examples/operations", section: "Workspaces" },
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

export function Navigation({ close }: { readonly close?: () => void }) {
  const location = useLocation();
  const items = navItems.map((item) => ({
    ...item,
    active: location.pathname === item.href || (item.href === "/components" && location.pathname.startsWith("/components/")),
  }));
  return <><Link className="docs-nav__brand" to="/" onClick={close}>Conductor</Link><NavList items={items} aria-label="Documentation" renderLink={(item, props) => <Link {...props} to={item.href} onClick={close} />} /></>;
}
