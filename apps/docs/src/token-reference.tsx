// Refs: WP-021 FR-DOC-004 FR-A11Y-004 FR-QA-001 FR-TOK-008
import { Banner, EmptyState, Panel, Table, TextField } from "@conductor-by-89soone/react";
import { useState } from "react";
import contrastReport from "./generated/contrast-report";
import { allPublicTokens, type FoundationToken } from "./foundations";

interface ContrastResult { readonly theme: "dark" | "light"; readonly foreground: string; readonly background: string; readonly ratio: number; readonly threshold: number; readonly pass: boolean; }
interface ContrastReport { readonly results: readonly ContrastResult[]; }

const allTokens = allPublicTokens();

function contrastFor(token: FoundationToken, report: ContrastReport | null): readonly ContrastResult[] {
  return report?.results.filter((result) => result.foreground === token.key) ?? [];
}

function Ratio({ token, report }: { readonly token: FoundationToken; readonly report: ContrastReport | null }) {
  if (report === null) return <>측정되지 않음</>;
  const results = contrastFor(token, report);
  if (results.length === 0) return token.usage === "decorative" ? <>장식 전용</> : <>대상 아님</>;
  return <>{results.map((result) => <span className={result.pass ? "docs-result docs-result--pass" : "docs-result docs-result--fail"} key={`${result.theme}-${result.background}`}>{result.theme} {result.ratio.toFixed(2)}:1 / {result.threshold}:1 {result.pass ? "pass" : "fail"}</span>)}</>;
}

export function TokenReference({ forceMissingReport = false }: { readonly forceMissingReport?: boolean }) {
  const [filter, setFilter] = useState("");
  const report = forceMissingReport ? null : contrastReport as ContrastReport | null;
  const filtered = allTokens.filter((token) => token.key.toLowerCase().includes(filter.toLowerCase()));
  return <section className="cdt-page" aria-labelledby="tokens-title"><div><p className="docs-eyebrow">Tokens</p><h1 id="tokens-title">Tokens</h1><p className="docs-lead">Semantic and component values are shown for both themes. Contrast is read from the build report.</p></div>{report === null ? <Banner tone="warning">대비 검사 결과 파일이 없습니다. 대비율 열은 측정되지 않음으로 표시됩니다.</Banner> : null}<TextField aria-label="Filter token keys" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter token keys" /><Table caption="Token reference"><Table.Head><Table.Row><Table.HeaderCell>Token key</Table.HeaderCell><Table.HeaderCell>Tier</Table.HeaderCell><Table.HeaderCell>Dark</Table.HeaderCell><Table.HeaderCell>Light</Table.HeaderCell><Table.HeaderCell>Contrast / verdict</Table.HeaderCell><Table.HeaderCell>Reason</Table.HeaderCell></Table.Row></Table.Head><Table.Body>{filtered.map((token) => <Table.Row key={token.key}><Table.Cell><code>{token.key}</code></Table.Cell><Table.Cell>{token.tier}</Table.Cell><Table.Cell><code>{token.values.dark}</code></Table.Cell><Table.Cell><code>{token.values.light}</code></Table.Cell><Table.Cell><Ratio token={token} report={report} /></Table.Cell><Table.Cell>{token.usage === "decorative" ? token.description : ""}</Table.Cell></Table.Row>)}</Table.Body></Table>{filtered.length === 0 ? <EmptyState title="No matching tokens" description={`No token key matches “${filter}”.`} /> : null}<Panel as="section"><h2>Layering order</h2><p className="cdt-mono">z.base · z.raised · z.sticky · z.drawer · z.overlay · z.popover</p><p className="cdt-muted">Consumer layers above z.popover are consumer-owned values.</p></Panel></section>;
}
