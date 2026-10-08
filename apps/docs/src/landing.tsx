// Refs: CR-042 WP-018 FR-DOC-001 FR-DOC-005 FR-THM-003 W-001
export function Overview() {
  return <section className="cdt-page" aria-labelledby="overview-title"><div><p className="docs-eyebrow">Design system</p><h1 id="overview-title">Conductor Design System</h1><p className="docs-lead">Reusable tokens, CSS, and React primitives for a focused operational interface.</p></div><div className="cdt-card-grid">{[["@conductor-by-89soone/tokens", "Theme-aware tokens and validation."], ["@conductor-by-89soone/css", "Layered, framework-agnostic styles."], ["@conductor-by-89soone/react", "Accessible composable primitives."]].map(([name, description]) => <article className="cdt-card" key={name}><h2>{name}</h2><p className="cdt-muted">{description}</p></article>)}</div></section>;
}
