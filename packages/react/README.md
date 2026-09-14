# @conductor-by-89soone/react

Accessible React primitives for the Conductor Design System. Interaction behavior is built on Radix UI and visual styling comes from `@conductor-by-89soone/css`.

## Install

```bash
pnpm add @conductor-by-89soone/react @conductor-by-89soone/css lucide-react
```

React and React DOM 18 or 19 are peer dependencies.

## Use

Import the stylesheet once, then import components from the package root:

```tsx
import "@conductor-by-89soone/css";
import { Button, Card } from "@conductor-by-89soone/react";

export function Example() {
  return (
    <Card>
      <Button variant="primary">Continue</Button>
    </Card>
  );
}
```

Set `data-cdt-theme="dark"` or `data-cdt-theme="light"` on the document root. Development builds warn once when the Conductor stylesheet is missing.

## Requirements

Node.js 20 or newer, React 18 or 19, React DOM 18 or 19, and `lucide-react` 0.400.0 or newer (below 2.0.0).

## License

MIT

## Workbench APIs (CR-041, review extension)

The additions below are a local review extension; installing a previously published
0.3.1 package does not provide them. Build and install the matching tokens, CSS,
and React tarballs together when evaluating this change. No component fetches,
authenticates, parses a search language, infers relationships, or retries work
without a consumer callback.

Load `@conductor-by-89soone/css` once in the application root. Set
`data-cdt-theme="dark"` or `data-cdt-theme="light"` on `html`; both palettes use the
same semantic keys. There is no new provider or remote font requirement. For a
locally themed island, pass that island's element as `Popover.Content container`
so portalled content inherits its theme. A body portal inherits the document
theme, not the trigger's nested theme.

In Next App Router, import CSS from the root layout and put state/callback code in
a small `"use client"` component. The package preserves client directives on
component modules and keeps its re-export barrel unmarked. A Server Component
can render a client component with serializable data; callback functions must be
created inside a client boundary. SSR output alone does not demonstrate hydration
or RSC compatibility; see the local verification record for executed consumers.

### Disclosure and overlay

```tsx
"use client";
import { Tabs, Popover, Collapsible, Button } from "@conductor-by-89soone/react";

export function Filters() {
  return <Tabs.Root defaultValue="results" activationMode="manual">
    <Tabs.List aria-label="Investigation view">
      <Tabs.Trigger value="results">Results</Tabs.Trigger>
      <Tabs.Trigger value="history">History</Tabs.Trigger>
      <Tabs.Trigger value="restricted" disabled>Unavailable</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="results" forceMount>
      <Popover.Root>
        <Popover.Trigger asChild><Button>More filters</Button></Popover.Trigger>
        <Popover.Content aria-label="Additional filters">
          <Collapsible.Root>
            <Collapsible.Trigger>Advanced conditions</Collapsible.Trigger>
            <Collapsible.Content>Consumer-owned filter fields</Collapsible.Content>
          </Collapsible.Root>
          <Popover.Close asChild><Button>Close</Button></Popover.Close>
        </Popover.Content>
      </Popover.Root>
    </Tabs.Content>
    <Tabs.Content value="history">History supplied by the consumer</Tabs.Content>
  </Tabs.Root>;
}
```

- `Tabs.Root` accepts Radix `value/onValueChange`, `defaultValue`, `orientation`
  and `activationMode`. Conductor defaults to **manual**: arrows/Home/End move
  focus, Enter/Space activate. `automatic` is opt-in for inexpensive content.
  Disabled triggers are skipped. Provide an initial value. Inactive contents
  unmount by default; `forceMount` preserves child state but keeps inactive
  panels hidden. Maintaining a panel can keep its consumer effects running.
- `Popover` provides `Root/Trigger/Anchor/Content/Close/Arrow`, with Radix open
  state, Escape/outside dismissal, and focus restoration. Give its content an
  accessible name; use `asChild` to avoid nesting buttons.
- `Collapsible` provides `Root/Trigger/Content`, Radix controlled or uncontrolled
  expansion and disabled props. Enter/Space toggle its trigger. The component
  does not request data on expansion: keep first-load, cached reopen, and explicit
  retry policy in the consumer. It is a disclosure, not a complete Accordion API.

### Search, filtering, and results

| API | Data and interaction contract | Consumer responsibility / incorrect use |
| --- | --- | --- |
| `Combobox` | Required `label`, `options: {id,label,disabled?}[]`, `value`, `query`, `onValueChange`, `onQueryChange`. `state` is ready/loading/error; `resultsQuery` hides stale option batches. Downshift owns single-selection keyboard behavior. IME composition does not commit Enter. `inputRef` targets input; forwarded ref targets wrapper. | Associate responses with their original query, supply error/retry UI as needed, and keep selected value separate from typed text. Do not label the single-selection popup as multi-select or publish stale results with the current query key. |
| `MultiSelect` | `label/options/value/onValueChange`, optional disabled; a fieldset/legend with existing Radix Checkbox controls, local option search, and removable selected chips. Tab reaches controls; Space toggles a checkbox. | Supply stable unique IDs and your approved options. Fetch/loading/error state is external. Do not treat this checkbox group as a single Combobox or infer authorization from disabled controls. |
| `FilterChip` | Text children plus required `removeLabel/onRemove`; optional disabled. Removal is a separate named button. | Use a specific label such as “Remove repository filter”; removing a chip does not parse or rewrite a query automatically. |
| `FilterToolbar` | A styled div forwarding HTML attributes/ref. It groups normal tabbable controls. | Give a group name if needed; this is not an ARIA toolbar with a roving arrow-key model. |
| `DataTable<Row>` | Required `label/rows/columns/rowId/rowLabel`. Columns supply `id/header/cell`, optional sortable/numeric. `sort/onSortChange` is external; `visibleColumns` and density control display. Semantic table, separately named preview buttons, no row click handler. | Sort the full local source or request server sorting before passing rows. Do not sort one cursor page and claim global order. Stable IDs must survive sorting/appending. Links in cells remain independent of selection. |
| DataTable selection/paging | `selectedId/onSelect(id, trigger)` selects one loaded row for preview. `hasMore/onLoadMore/loadingMore` exposes cursor continuation. No page counts or cursor storage. | Preserve opaque cursors in session state; share conditions in the URL without cursors. This is not “select all results”. Own URL replace/push and permission-bound resets. |
| DataTable states | `state`: ready/loading/error/partial, optional `message`; an empty rows array yields empty state. Loading is busy, partial/error retain provided rows. Density defaults comfortable; compact is explicit. | Announce whether rows are stale/partial using message. The component has no sorting, resizing, pinning, or virtualization engine. |

```tsx
"use client";
import { useRef, useState } from "react";
import { DataTable, DetailInspector, WorkbenchLayout, CopyButton,
  type DataColumn } from "@conductor-by-89soone/react";

type Row = { id: string; title: string };
const rows: Row[] = [{ id: "sample:change:1", title: "검색 맥락 보존 / preserve context" }];
const columns: DataColumn<Row>[] = [
  { id: "title", header: "Title", cell: row => row.title },
];
export function SearchPreview() {
  const [selectedId, select] = useState<string | null>(null);
  const [width, setWidth] = useState(40);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const selected = rows.find(row => row.id === selectedId);
  return <WorkbenchLayout width={width} onWidthChange={setWidth}
    inspector={selected && <DetailInspector label="Selected change"
      returnFocusRef={trigger} onClose={() => select(null)}>
      <p>{selected.title}</p><code>{selected.id}</code>
      <CopyButton value={selected.id} label="Copy identifier" />
    </DetailInspector>}>
    <DataTable label="Loaded changes" rows={rows} columns={columns}
      rowId={row => row.id} rowLabel={row => row.title} selectedId={selectedId}
      onSelect={(id, button) => { trigger.current = button; select(id); }} />
  </WorkbenchLayout>;
}
```

`WorkbenchLayout` accepts children and an optional inspector, with a controlled
25–60 percent inspector `width` (default 40) and `onWidthChange`. The native range
control supports keyboard adjustment; small screens stack the areas. This is not
a draggable separator or a modal focus trap. `DetailInspector` closes on its
button or unhandled Escape, calls `onClose`, then focuses `returnFocusRef` without
scrolling. Keep the selecting row mounted; if it disappears, the consumer must
choose a meaningful fallback. Preview uses existing row data and makes no request.

`PathList` takes `items: {id,label,children?,state?}[]`, optional
`selectedId/onPathSelect`. Folders are initially collapsed native details; Tab and
Enter/Space operate summaries, leaves are buttons. `state: loading/error` reports
lazy-data state; fetching/retry is external. It is a **path list**, not an ARIA
TreeView: there is no tree arrow-key or typeahead promise. `Breadcrumb` is a nav
wrapper (default accessible name “경로”); supply links/separators/current-page
semantics as children. `Skeleton` requires `label` and reports loading status.
`CopyButton` reports clipboard success/failure and ignores feedback for another
current value; display selectable text alongside it for unavailable clipboard
fallback. None of these APIs store navigation or clipboard data persistently.

### Relationship exploration

The graph is also available from the optional `@conductor-by-89soone/react/relation`
entry, exporting `RelationGraph`, `layoutRelationNodes`, and their public types.
It uses the same implementation and shared Conductor stylesheet, with no extra
visualization dependency. Use this entry in a client component or dynamic import
to isolate graph loading; importing Button alone does not load graph code.

```tsx
import { RelationGraph } from "@conductor-by-89soone/react";

export function Relations() {
  return <RelationGraph label="Synthetic change relationships" state="partial"
    stateMessage="Synthetic data; production relationship service is not connected"
    nodes={[
      { id: "sample:change:a", label: "Change A" },
      { id: "sample:change:b", label: "Change B" },
    ]}
    edges={[{ id: "sample:edge:ab", source: "sample:change:a",
      target: "sample:change:b", type: "references", label: "references",
      evidence: "Synthetic example text links A to B", confidence: "inferred",
      ambiguous: true }]} />;
}
```

`RelationGraph` receives nodes and edges; node IDs and edge IDs are independent,
stable, consumer-defined identifiers. An edge is read as **source → label →
target**. Optional `unresolved/ambiguous/retracted` flags are independent;
map a consumer's detached state to `retracted` without discarding other flags.
Missing endpoint metadata is displayed as unavailable information, not fetched.
`confidence` and `evidence` are text, not an inference engine or HTML renderer.
Sanitize the *data scope* on the server before passing it: `unavailable` is a
presentation hint, not authorization, and does not hide a supplied private label.
Never pass unauthorized nodes, hidden counts, or inaccessible connecting edges.

Node search, type filtering, node/edge selection, neighbor emphasis, zoom,
directional pan buttons, fit view, and selected evidence form one read-only flow.
The SVG is hidden from assistive technology; semantic node/edge tables expose the
same selection and information with normal links/buttons. There is no graph
editing, drag-to-connect, deletion, node movement, or recursive fetch. Nodes use
deterministic ID ordering; geometric placement is not time, dependency order,
merge sequence, confidence, or importance. Cycles are allowed.

`selection/onSelectionChange` and `viewport/onViewportChange` can be controlled;
otherwise their state is local to the mounted instance. A consumer can retain
these values across its own navigation, but the package adds no persistence.
`state` supports ready/loading/empty/error/partial and `stateMessage` supplies
context. `onRetry` renders an explicit retry only for error; it does not auto-poll.
A filter can hide a selected edge without resetting selection; details say so.
Use an empty state only for confirmed absence, not for unresolved or partial data.
The generic component has no production graph endpoint; demos are synthetic.

### Processing status

```tsx
import { ProcessingStatus } from "@conductor-by-89soone/react";

export function Processing() {
  return <ProcessingStatus label="Synthetic processing stages" stages={[
    { id: "received", label: "Received", status: "complete", detail: "Receipt confirmed" },
    { id: "stored", label: "Durably stored", status: "complete", detail: "Storage confirmed" },
    { id: "processed", label: "Processed", status: "delayed", detail: "Waiting for the consumer worker" },
    { id: "indexed", label: "Indexed", status: "unknown", detail: "Search freshness not confirmed" },
  ]} />;
}
```

`ProcessingStatus` accepts `label` and `stages` with stable `id`, `label`,
`status: complete/pending/delayed/failed/unknown`, and explanatory `detail`.
An optional `action` has `label/onAction/disabledReason/busy`; omit it when there
is no allowed action, show a reason when it is unavailable, and make callback
outcomes visible. Existing Timeline, Badge, and Button render the pattern.
Native button keyboard behavior applies. There are no percentages, ETAs, requests,
automatic retries, or timers. A complete receipt stage says nothing about durable
storage or index freshness. Preserve successful stages alongside partial failures.
Consumers retain their already approved polling and authorization policies.

### Migration from consumer-owned compositions

1. Build and pack all three packages, install matching tarballs, import CSS once,
   and verify React peer resolution and Next hydration before application rollout.
2. Replace local Tabs with compound `Tabs` parts; explicitly choose manual or
   automatic activation, initial value, controlled selection, and panel lifetime.
   Keep expensive fetching out of mere keyboard focus changes.
3. Map local filter values/options into `Combobox`, `MultiSelect`, and `FilterChip`.
   Keep query parsing, stale-request generations, session-bound cursors, and URL
   replace/push semantics in the consumer.
4. Replace table/workbench presentation with `DataTable/WorkbenchLayout/DetailInspector`.
   Keep stable identity, current-row reuse, detail routing, and return-focus refs.
   Add compact density explicitly; existing Card styling is unchanged.
5. Adapt already authorized relations into `RelationNode/RelationEdge`; retain
   direction, ambiguity, unresolved/detached states, evidence, and confidence.
   Preserve lazy first expansion and cached reopen; do not turn one pending
   relation category into “all relationships absent”. A planned graph API still
   requires a consumer adapter and production integration work.
6. Connect menu controls using `AppShellNavTrigger` under the same `AppShell`
   context (use `asChild` with an existing Button). Keep route-to-main focus.
   Remove any old animation-frame fallback only after the consumer reproduces
   Escape/outside-close/navigation focus with the new package; package regression
   tests alone do not prove the original consumer has migrated.

This repository change does not migrate or write to a production consumer.
Published version changes, visual/API snapshots, browser matrices, measured bundle
costs, and checks that could not run must be reviewed with the implementation log.
