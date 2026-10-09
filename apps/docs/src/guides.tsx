// Refs: CR-042 WP-022 FR-DOC-006 FR-DOC-007 FR-A11Y-003 FR-QA-003
//
// W-040 Patterns and W-050 Accessibility. The vocabulary tables, the recommended / prohibited
// examples and every asserted sentence are unchanged; the pages gain a shared head, labelled rule
// pairs and a measured contrast stat. `CopyCode` is imported by the catalog detail screen and keeps
// its exact button labels and live-region behaviour (FR-DOC-006).
// Page styles ride with the lazy route chunks so the landing never downloads them (CR-042, NFR-001).
import "./styles/pages.css";
import { Badge, Banner, Button, CodeBlock, Dialog, Drawer, Field, Kbd, Meter, Panel, SeverityTag, StatusBadge, Table, TextField } from "@conductor-by-89soone/react";
import { Check, ShieldCheck, TriangleAlert, Undo2, X } from "lucide-react";
import allowList from "../../../axe-allowlist.json";
import contrastReport from "./generated/contrast-report";
import { useEffect, useState, type ReactNode } from "react";

const statusRules = [["queued", "Waiting to start"], ["running", "Work in progress"], ["waiting", "Awaiting input"], ["success", "Completed successfully"], ["partial", "Completed with exceptions"], ["danger", "Failed or unsafe"], ["neutralEnd", "Ended without a terminal result"]] as const;
const severityRules = [["read", "Read-only impact"], ["write", "Changes external state"], ["destructive", "Irreversible or destructive action"], ["blocked", "Action is prohibited"]] as const;

export function CopyCode({ code, forceUnavailable = false }: { readonly code: string; readonly forceUnavailable?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "failed" | "unavailable">("idle");
  const available = !forceUnavailable && typeof navigator !== "undefined" && navigator.clipboard?.writeText !== undefined;
  useEffect(() => { if (state !== "copied") return undefined; const timer = window.setTimeout(() => setState("idle"), 2000); return () => window.clearTimeout(timer); }, [state]);
  const copy = async () => { if (!available) { setState("unavailable"); return; } try { await navigator.clipboard.writeText(code); setState("copied"); } catch { setState("failed"); } };
  const label = state === "copied" ? "복사됨" : state === "failed" ? "복사할 수 없음" : state === "unavailable" ? "복사할 수 없음" : "Copy code";
  return <div className="docs-code-example"><CodeBlock language="tsx" code={code} /><Button size="sm" disabled={!available} onClick={() => void copy()}>{label}</Button><span className="cdt-sr-only" aria-live="polite">{state === "copied" ? "복사됨" : ""}</span></div>;
}

function RulePair({ id, title, intro, recommended, prohibited, reason }: { readonly id: string; readonly title: string; readonly intro: string; readonly recommended: ReactNode; readonly prohibited: ReactNode; readonly reason: string }) {
  const headingId = `rule-${id}`;
  return (
    <section className="docs-rule" aria-labelledby={headingId}>
      <div className="docs-section-head">
        <h2 id={headingId}>{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="docs-rule__grid">
        <div className="docs-rule__panel docs-rule__panel--do">
          <h3 className="docs-rule__label docs-rule__label--do"><Check size={14} strokeWidth={2.25} aria-hidden="true" />Recommended</h3>
          <div className="docs-rule__stage docs-canvas">{recommended}</div>
        </div>
        <div className="docs-rule__panel docs-rule__panel--dont">
          <h3 className="docs-rule__label docs-rule__label--dont"><X size={14} strokeWidth={2.25} aria-hidden="true" />Do not</h3>
          <div className="docs-rule__stage docs-canvas">{prohibited}</div>
          <p className="docs-rule__reason">Reason: {reason}</p>
        </div>
      </div>
    </section>
  );
}

export function Patterns() {
  return (
    <section className="cdt-page docs-guide" aria-labelledby="patterns-title">
      <div className="docs-page-head">
        <p className="docs-eyebrow">Guides</p>
        <h1 id="patterns-title">Patterns</h1>
        <p className="docs-lead">How status, severity, errors and thresholds are communicated, so that no meaning rides on colour alone and every screen reads the same way.</p>
      </div>

      <section className="docs-vocab" aria-labelledby="vocab-title">
        <div className="docs-section-head">
          <h2 id="vocab-title">Status and severity vocabulary</h2>
          <p>Each value pairs a colour with an icon and a label. The tables are the canonical mapping; components take the value, never the colour.</p>
        </div>
        <Table caption="Status usage">
          <Table.Head>
            <Table.Row><Table.HeaderCell>Status</Table.HeaderCell><Table.HeaderCell>Use when</Table.HeaderCell><Table.HeaderCell>Example</Table.HeaderCell></Table.Row>
          </Table.Head>
          <Table.Body>
            {statusRules.map(([status, description]) => <Table.Row key={status}><Table.Cell>{status}</Table.Cell><Table.Cell>{description}</Table.Cell><Table.Cell><StatusBadge status={status} icon="●" label={status} /></Table.Cell></Table.Row>)}
          </Table.Body>
        </Table>
        <Table caption="Severity usage">
          <Table.Head>
            <Table.Row><Table.HeaderCell>Severity</Table.HeaderCell><Table.HeaderCell>Use when</Table.HeaderCell><Table.HeaderCell>Example</Table.HeaderCell></Table.Row>
          </Table.Head>
          <Table.Body>
            {severityRules.map(([severity, description]) => <Table.Row key={severity}><Table.Cell>{severity}</Table.Cell><Table.Cell>{description}</Table.Cell><Table.Cell><SeverityTag severity={severity} icon="●" label={severity} /></Table.Cell></Table.Row>)}
          </Table.Body>
        </Table>
      </section>

      <RulePair id="status" title="Status is not color alone" intro="A status badge always carries an icon and a label next to its colour." recommended={<StatusBadge status="success" icon="✓" label="Success" />} prohibited={<span className="docs-color-dot" aria-hidden="true" />} reason="A color-only marker is not distinguishable in grayscale or by assistive technology." />
      <RulePair id="errors" title="Form errors need text" intro="An invalid field names the problem and how to recover from it." recommended={<Field label="Name" error="Name is required"><TextField /></Field>} prohibited={<TextField aria-label="Name" invalid />} reason="A red border alone does not communicate the error or recovery path." />
      <RulePair id="meters" title="Exceeded meters show the value" intro="When a meter passes its limit, the number says so; the fill colour only confirms it." recommended={<Meter aria-label="Usage" value={120} max={100} exceededAt={100} valueText="120% of limit" />} prohibited={<div className="docs-meter-only" aria-hidden="true" />} reason="The threshold must be conveyed with a numerical text alternative." />

      <div className="docs-guide__grid">
        <Panel as="section" aria-labelledby="density-title">
          <h2 id="density-title">Density</h2>
          <p>Use a 14px body rhythm, 1.5 line height, and controls at least 40px tall (42px on compact screens).</p>{/* cdt-allow-literal: 산문이 인용하는 토큰 값(font.size.md, button.minHeight, button.minHeightCompact)이며 렌더되는 치수가 아니다 */}
          <p className="docs-guide__muted">The quoted values are <code>font.size.md</code>, <code>button.minHeight</code> and <code>button.minHeightCompact</code>; if one changes, this sentence changes with it.</p>
        </Panel>
        <Panel as="section" aria-labelledby="overlay-title">
          <h2 id="overlay-title">Dialog or Drawer?</h2>
          <p>Use <strong>Dialog</strong> for a focused confirmation or short task. Use <strong>Drawer</strong> for contextual detail that benefits from retaining the page alongside it.</p>
          <div className="docs-preview-row">
            <Dialog.Root><Dialog.Trigger>Open dialog example</Dialog.Trigger><Dialog.Content><Dialog.Title>Confirm action</Dialog.Title><Dialog.Description>Use a Dialog for a focused decision.</Dialog.Description></Dialog.Content></Dialog.Root>
            <Drawer.Root><Drawer.Trigger>Open drawer example</Drawer.Trigger><Drawer.Content><Drawer.Title>Contextual detail</Drawer.Title></Drawer.Content></Drawer.Root>
          </div>
        </Panel>
      </div>

      <p className="docs-guide__note">No separate rules are published for layout-only and decorative primitives; they are intentionally omitted.</p>
    </section>
  );
}

const axeAllowList = allowList as readonly { readonly rule: string; readonly reason: string }[];

interface ReportSummary { readonly passed: number; readonly failed: number; readonly checks: number; }

export function Accessibility({ forceMissingReport = false }: { readonly forceMissingReport?: boolean }) {
  const report = forceMissingReport ? null : contrastReport as { readonly summary?: ReportSummary } | null;
  const summary = report?.summary;
  return (
    <section className="cdt-page docs-guide" aria-labelledby="accessibility-title">
      <div className="docs-page-head">
        <p className="docs-eyebrow">Guides</p>
        <h1 id="accessibility-title">Accessibility</h1>
        <p className="docs-lead">Conductor targets WCAG 2.1 AA and delegates complex overlay behavior to Radix primitives.</p>
      </div>

      <Panel as="section" aria-labelledby="contrast-title">
        <div className="docs-section-head">
          <h2 id="contrast-title">Contrast report</h2>
          <p>Every declared foreground and background pair is measured in both themes by the token build; the numbers below are the release gate&apos;s.</p>
        </div>
        {report === null || summary === undefined ? <Banner tone="warning">Contrast metrics are unavailable.</Banner> : (
          <div className="docs-contrast">
            <div className="docs-contrast__head">
              <span className="docs-stat__value">{summary.passed}<small> / {summary.checks}</small></span>
              <span className="docs-stat__label">Pairs passing</span>
            </div>
            <Meter aria-label="Contrast pairs passing" value={summary.passed} max={summary.checks} valueText={`${summary.passed} of ${summary.checks}`} />
            <p>{summary.passed} of {summary.checks} checks passed; {summary.failed} failed.</p>
          </div>
        )}
        <p className="docs-guide__muted">Focus rings and control borders are checked as non-text at 3:1 or better.</p>
      </Panel>

      <div className="docs-guide__grid">
        <Panel as="section" aria-labelledby="keyboard-title">
          <h2 id="keyboard-title">Keyboard paths</h2>
          <ul className="docs-keypaths">
            <li><span className="docs-keypaths__keys" aria-hidden="true"><Kbd>Tab</Kbd></span><span>Tab follows visual order and the skip link reaches main content.</span></li>
            <li><span className="docs-keypaths__keys" aria-hidden="true"><Kbd>Esc</Kbd></span><span>Escape closes Dialog, Drawer, DropdownMenu, and Select.</span></li>
            <li><span className="docs-keypaths__keys" aria-hidden="true"><span className="docs-keypaths__icon"><Undo2 size={14} strokeWidth={2} /></span></span><span>Focus returns to the trigger after an overlay closes.</span></li>
          </ul>
        </Panel>
        <Panel as="section" aria-labelledby="signal-title">
          <h2 id="signal-title">Color is not the only signal</h2>
          <p>Status, severity, invalid fields, and exceeded meters expose text and/or icons in addition to color.</p>
          <div className="docs-canvas docs-preview-row">
            <StatusBadge status="success" icon="✓" label="Success" />
            <SeverityTag severity="destructive" icon="●" label="destructive" />
            <Badge tone="warning" icon={<TriangleAlert size={12} aria-hidden="true" />}>120% of limit</Badge>
          </div>
        </Panel>
      </div>

      <Panel as="section" aria-labelledby="axe-title">
        <h2 id="axe-title">axe allow list</h2>
        {axeAllowList.length === 0 ? (
          <p className="docs-ok"><span className="docs-ok__icon"><ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" /></span>No axe exceptions are currently allowed.</p>
        ) : (
          <Table caption="axe allow list">
            <Table.Head><Table.Row><Table.HeaderCell>Rule</Table.HeaderCell><Table.HeaderCell>Reason</Table.HeaderCell></Table.Row></Table.Head>
            <Table.Body>{axeAllowList.map((entry) => <Table.Row key={entry.rule}><Table.Cell>{entry.rule}</Table.Cell><Table.Cell>{entry.reason}</Table.Cell></Table.Row>)}</Table.Body>
          </Table>
        )}
        <p className="docs-guide__muted">The a11y gate runs axe-core on every public component; a serious or critical finding fails the build unless it is listed here with a reason.</p>
      </Panel>
    </section>
  );
}
