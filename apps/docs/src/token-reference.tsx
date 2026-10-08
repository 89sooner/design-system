// Refs: CR-042 WP-021 FR-DOC-004 FR-A11Y-004 FR-QA-001 FR-TOK-008
//
// W-030. The reference table keeps its caption, filter and verdict strings (asserted by
// `e2e/tokens.spec.ts`); around it the page gains a stat strip, a summary line that follows the
// filter, tier badges, colour chips beside colour values and a layering diagram for the z scale.
import { Badge, Banner, EmptyState, Panel, Table, TextField } from "@conductor-by-89soone/react";
import { Search } from "lucide-react";
import { useState } from "react";
import contrastReport from "./generated/contrast-report";
import { allPublicTokens, type FoundationToken } from "./foundations";

interface ContrastResult { readonly theme: "dark" | "light"; readonly foreground: string; readonly background: string; readonly ratio: number; readonly threshold: number; readonly pass: boolean; }
interface ContrastSummary { readonly checks: number; readonly passed: number; readonly failed: number; }
interface ContrastReport { readonly summary?: ContrastSummary; readonly results: readonly ContrastResult[]; }

const allTokens = allPublicTokens();
const semanticCount = allTokens.filter((token) => token.tier === "semantic").length;
const componentCount = allTokens.length - semanticCount;
const themeCount = Object.keys(allTokens[0]?.values ?? {}).length;
const layerTokens = allTokens.filter((token) => token.key.startsWith("z.")).sort((one, other) => Number(other.values.dark) - Number(one.values.dark));

const COLOR_VALUE = /^(?:#|rgb|hsl)/i;

function contrastFor(token: FoundationToken, report: ContrastReport | null): readonly ContrastResult[] {
  return report?.results.filter((result) => result.foreground === token.key) ?? [];
}

function Ratio({ token, report }: { readonly token: FoundationToken; readonly report: ContrastReport | null }) {
  if (report === null) return <>측정되지 않음</>;
  const results = contrastFor(token, report);
  if (results.length === 0) return token.usage === "decorative" ? <>장식 전용</> : <>대상 아님</>;
  return (
    <span className="docs-results">
      {results.map((result) => (
        <span className={result.pass ? "docs-result docs-result--pass" : "docs-result docs-result--fail"} key={`${result.theme}-${result.background}`}>
          {result.theme} {result.ratio.toFixed(2)}:1 / {result.threshold}:1 {result.pass ? "pass" : "fail"}
        </span>
      ))}
    </span>
  );
}

function TokenValue({ value }: { readonly value: string }) {
  return (
    <span className="docs-value">
      {COLOR_VALUE.test(value) ? <span className="docs-color-chip" style={{ background: value }} aria-hidden="true" /> : null}
      <code>{value}</code>
    </span>
  );
}

/**
 * Break opportunities after each dot and before each capitalised segment, so a long key wraps along
 * its own structure, and only when the column is narrower than the key.
 */
function TokenKey({ value }: { readonly value: string }) {
  const pieces = value.split(/(?<=\.)|(?=[A-Z][a-z])/);
  return <code>{pieces.map((piece, index) => <span key={`${piece}-${index}`}>{index > 0 ? <wbr /> : null}{piece}</span>)}</code>;
}

function plain(description: string | undefined): string {
  return description?.replace(/`/g, "").trim() ?? "";
}

export function TokenReference({ forceMissingReport = false }: { readonly forceMissingReport?: boolean }) {
  const [filter, setFilter] = useState("");
  const report = forceMissingReport ? null : contrastReport as ContrastReport | null;
  const summary = report?.summary;
  const filtered = allTokens.filter((token) => token.key.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section className="cdt-page docs-tokens" aria-labelledby="tokens-title">
      <div className="docs-page-head">
        <p className="docs-eyebrow">Reference</p>
        <h1 id="tokens-title">Tokens</h1>
        <p className="docs-lead">Semantic and component values are shown for both themes. Contrast is read from the build report, so every verdict here is the one the release gate measured.</p>
      </div>

      {report === null ? <Banner tone="warning">대비 검사 결과 파일이 없습니다. 대비율 열은 측정되지 않음으로 표시됩니다.</Banner> : null}

      <ul className="docs-stat-grid">
        <li className="docs-stat">
          <span className="docs-stat__value">{allTokens.length}</span>
          <span className="docs-stat__label">Tokens</span>
          <span className="docs-stat__detail">{semanticCount} semantic · {componentCount} component</span>
        </li>
        <li className="docs-stat">
          <span className="docs-stat__value">{themeCount}</span>
          <span className="docs-stat__label">Themes</span>
          <span className="docs-stat__detail">Same keys, swapped values</span>
        </li>
        <li className="docs-stat">
          <span className="docs-stat__value">{summary === undefined ? "–" : <>{summary.passed}<small> / {summary.checks}</small></>}</span>
          <span className="docs-stat__label">Contrast checks</span>
          <span className="docs-stat__detail">{summary === undefined ? "Report unavailable" : `${summary.failed} failed · WCAG 2.1 AA`}</span>
        </li>
      </ul>

      <div className="docs-toolbar">
        <div className="docs-toolbar__field">
          <TextField iconStart={<Search size={16} strokeWidth={1.75} aria-hidden="true" />} aria-label="Filter token keys" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by key, for example status.danger" />
        </div>
        <p className="docs-toolbar__summary" aria-live="polite">{allTokens.length} tokens · {filtered.length} shown</p>
      </div>

      <Table caption="Token reference">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Token key</Table.HeaderCell>
            <Table.HeaderCell>Tier</Table.HeaderCell>
            <Table.HeaderCell>Dark</Table.HeaderCell>
            <Table.HeaderCell>Light</Table.HeaderCell>
            <Table.HeaderCell>Contrast / verdict</Table.HeaderCell>
            <Table.HeaderCell>Reason</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {filtered.map((token) => (
            <Table.Row key={token.key}>
              <Table.Cell className="docs-token-key"><TokenKey value={token.key} /></Table.Cell>
              <Table.Cell><Badge tone={token.tier === "semantic" ? "accent" : "neutral"}>{token.tier}</Badge></Table.Cell>
              <Table.Cell><TokenValue value={token.values.dark} /></Table.Cell>
              <Table.Cell><TokenValue value={token.values.light} /></Table.Cell>
              <Table.Cell><Ratio token={token} report={report} /></Table.Cell>
              <Table.Cell className="docs-token-reason">{token.usage === "decorative" ? <span className="docs-token-reason__text">{plain(token.description)}</span> : null}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {filtered.length === 0 ? <EmptyState icon={<Search size={20} strokeWidth={1.75} aria-hidden="true" />} title="No matching tokens" description={`No token key matches “${filter}”.`} /> : null}

      <Panel as="section" aria-labelledby="layering-title">
        <div className="docs-section-head">
          <h2 id="layering-title">Layering order</h2>
          <p>Six z-index steps, highest first. Consumer layers above z.popover are consumer-owned values.</p>
        </div>
        <ol className="docs-zstack">
          {layerTokens.map((token) => (
            <li key={token.key} className="docs-zstack__layer">
              <code>{token.key}</code>
              <span className="docs-zstack__value">{token.values.dark}</span>
              <span className="docs-zstack__desc">{plain(token.description)}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </section>
  );
}
