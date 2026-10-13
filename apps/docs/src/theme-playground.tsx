// Refs: CR-052 FR-DOC-010 W-031
//
// Theme playground: change the accent, the radius scale and the control density, and see the
// components and the accent's contrast pairs respond. Overrides apply to the preview region only
// (custom properties on its root), never to the site shell, and nothing is stored or sent.
import tokenArtifact from "@conductor-by-89soone/tokens/tokens.json";
import { STATUS_ICONS } from "@conductor-by-89soone/tokens";
import { Badge, Banner, Button, Card, Checkbox, CodeBlock, CopyButton, Field, Panel, ProgressRing, Select, StatusBadge, Switch, Table, TextField } from "@conductor-by-89soone/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState, type CSSProperties } from "react";
import contrastReport from "./generated/contrast-report";
import type { Theme } from "./theme";
import { cssOverrides, defaultSettings, isHexColour, measureAccentPairs, overrideSnippet, RADIUS_FACTORS, semanticOverrides, type PairResult, type PlaygroundSettings, type PlaygroundToken, type RadiusScale } from "./theme-overrides";

const tokens = tokenArtifact.tokens as PlaygroundToken[];
const results = contrastReport.results as readonly PairResult[];

// Preset accents are sample inputs to the playground, not colours this page is styled with.
const PRESETS: readonly { readonly name: string; readonly hex: string }[] = [
  { name: "Teal", hex: "#14b8a6" }, // cdt-allow-literal: sample accent input
  { name: "Violet", hex: "#8b5cf6" }, // cdt-allow-literal: sample accent input
  { name: "Amber", hex: "#d97706" }, // cdt-allow-literal: sample accent input
  { name: "Rose", hex: "#e11d48" }, // cdt-allow-literal: sample accent input
];
const RADIUS_LABELS: Readonly<Record<RadiusScale, string>> = { sharp: "Sharp (0×)", tight: "Tight (0.5×)", default: "Default (1×)", round: "Round (1.5×)" };

function ResultBadge({ pass }: { readonly pass: boolean }) {
  const Icon = pass ? CheckCircle2 : XCircle;
  const status = pass ? "success" : "danger";
  return <StatusBadge status={status} icon={<Icon size={14} strokeWidth={2} data-icon={STATUS_ICONS[status]} />} label={pass ? "Pass" : "Fail"} />;
}

function Preview({ style, compact }: { readonly style: CSSProperties; readonly compact: boolean }) {
  const size = compact ? "sm" : "md";
  return <div className="docs-playground__preview" style={style} aria-label="Preview" role="region">
    <div className="docs-playground__row">
      <Button variant="primary" size={size}>Deploy</Button>
      <Button size={size}>Review</Button>
      <Button tone="accent" size={size}>Promote</Button>
      <Button variant="ghost" size={size}>Cancel</Button>
    </div>
    <div className="docs-playground__row">
      <Field label="Service name"><TextField size={size} defaultValue="web-console" /></Field>
      <Field label="Notify on failure"><Switch defaultChecked /></Field>
      <Field label="Weekly digest"><Checkbox defaultChecked /></Field>
    </div>
    <Card size={size}>
      <div className="docs-playground__card">
        <ProgressRing aria-label="Rollout progress" value={64} valueText="64%" size={compact ? "sm" : "md"} />
        <div><strong>Rollout to production</strong><p className="cdt-muted">Focus a control to see the focus ring.</p></div>
        <Badge>canary</Badge>
      </div>
    </Card>
  </div>;
}

export function ThemePlayground({ theme }: { readonly theme: Theme }) {
  const [byTheme, setByTheme] = useState<Partial<Record<Theme, PlaygroundSettings>>>({});
  const settings = byTheme[theme] ?? defaultSettings(tokens, theme);
  const update = (next: Partial<PlaygroundSettings>) => setByTheme((current) => ({ ...current, [theme]: { ...settings, ...next } }));
  const accentValid = isHexColour(settings.accent);
  const overrides = semanticOverrides(tokens, theme, settings);
  const declarations = cssOverrides(tokens, overrides);
  const pairs = measureAccentPairs(results, theme, overrides);
  const failing = pairs.filter((pair) => !pair.pass).length;
  const style = Object.fromEntries(declarations) as CSSProperties;
  const snippet = overrideSnippet(theme, declarations);
  const swatch = accentValid ? settings.accent.trim() : defaultSettings(tokens, theme).accent;

  return <section className="cdt-page docs-playground" aria-labelledby="playground-title">
    <div><p className="docs-eyebrow">REFERENCE</p><h1 id="playground-title">Theme playground</h1><p className="docs-lead">Try an accent, a radius scale and a density, and check the contrast before you ship the override.</p></div>
    <Banner tone="info"><span>Editing the <strong>{theme}</strong> theme. Use the theme switch in the top bar to edit the other one. Changes stay on this page; nothing is saved.</span></Banner>
    <div className="docs-playground__layout">
      <Panel as="section" aria-labelledby="playground-controls" className="docs-playground__controls">
        <h2 id="playground-controls">Controls</h2>
        <Field label="Accent" description="A #rrggbb colour. It drives the accent, its soft and glow tints, the focus ring and the accent tone tints." error={accentValid ? undefined : "Enter a colour as #rrggbb."}>
          <TextField value={settings.accent} spellCheck={false} onChange={(event) => update({ accent: event.target.value })} />
        </Field>
        <div className="docs-playground__presets" role="group" aria-label="Accent presets">
          <input type="color" aria-label="Pick accent colour" value={swatch} onChange={(event) => update({ accent: event.target.value })} />
          {PRESETS.map((preset) => <Button key={preset.hex} size="sm" variant="ghost" aria-pressed={settings.accent.toLowerCase() === preset.hex} onClick={() => update({ accent: preset.hex })} iconStart={<span className="docs-playground__dot" style={{ background: preset.hex }} />}>{preset.name}</Button>)}
        </div>
        <Field label="Radius scale" description="Multiplies radius.xs to radius.xl. Pills stay pills.">
          <Select.Root value={settings.radius} onValueChange={(value) => update({ radius: value as RadiusScale })}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>{(Object.keys(RADIUS_FACTORS) as RadiusScale[]).map((scale) => <Select.Item key={scale} value={scale}>{RADIUS_LABELS[scale]}</Select.Item>)}</Select.Content>
          </Select.Root>
        </Field>
        <Field label="Compact controls" description="Renders the preview with the small control size."><Switch checked={settings.density === "compact"} onCheckedChange={(checked) => update({ density: checked ? "compact" : "comfortable" })} /></Field>
        <Button variant="ghost" onClick={() => setByTheme((current) => ({ ...current, [theme]: undefined }))}>Reset {theme} theme</Button>
      </Panel>
      <Preview style={style} compact={settings.density === "compact"} />
    </div>

    <section className="docs-playground__section" aria-labelledby="playground-contrast">
      <h2 id="playground-contrast">Accent contrast</h2>
      <p role="status" className={failing === 0 ? "cdt-muted" : "docs-playground__failing"}>{failing === 0 ? `All ${pairs.length} accent pairs pass WCAG 2.1 AA.` : `${failing} of ${pairs.length} accent pairs fail WCAG 2.1 AA.`}</p>
      <Table caption={`Pairs that use the accent, ${theme} theme`}>
        <Table.Head><Table.Row><Table.HeaderCell>Pair</Table.HeaderCell><Table.HeaderCell>Foreground on background</Table.HeaderCell><Table.HeaderCell>Ratio</Table.HeaderCell><Table.HeaderCell>Needs</Table.HeaderCell><Table.HeaderCell>Result</Table.HeaderCell></Table.Row></Table.Head>
        <Table.Body>{pairs.map((pair) => <Table.Row key={pair.id}>
          <Table.Cell className="cdt-mono">{pair.id}</Table.Cell>
          <Table.Cell><code>{pair.foreground}</code> on <code>{pair.background}</code></Table.Cell>
          <Table.Cell numeric>{pair.ratio.toFixed(2)}{pair.ratio === pair.baseline ? null : <span className="cdt-muted"> (was {pair.baseline.toFixed(2)})</span>}</Table.Cell>
          <Table.Cell numeric>{pair.threshold}:1</Table.Cell>
          <Table.Cell><ResultBadge pass={pair.pass} /></Table.Cell>
        </Table.Row>)}</Table.Body>
      </Table>
    </section>

    <section className="docs-playground__section" aria-labelledby="playground-css">
      <h2 id="playground-css">Override CSS</h2>
      <p className="cdt-muted">Add after <code>@conductor-by-89soone/css</code>. Component tokens hold resolved values, so the snippet lists every property that follows the changed tokens, not only the semantic ones.</p>
      <CodeBlock code={snippet} language="css" />
      <CopyButton value={snippet} label="Copy CSS" />
    </section>
  </section>;
}
