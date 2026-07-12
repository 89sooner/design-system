// Refs: WP-020 FR-DOC-003 FR-DX-002
import * as Components from "@conductor/react";
import generated from "./generated/component-meta.json";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CopyCode } from "./guides";

export interface ComponentMeta { readonly name: string; readonly propsTypeName: string; readonly props: readonly { readonly name: string; readonly required: boolean; readonly type: string }[]; }
export const componentMeta = generated as readonly ComponentMeta[];

class PreviewBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  override componentDidCatch(_error: Error, _info: ErrorInfo): void {}
  override render(): ReactNode { return this.state.failed ? <Components.Banner tone="danger">This preview could not render.</Components.Banner> : this.props.children; }
}

export function ComponentPreview({ name }: { readonly name: string }) {
  switch (name) {
    case "Button": return <div className="docs-preview-row">{(["primary", "secondary", "ghost"] as const).flatMap((variant) => (["neutral", "accent", "danger"] as const).map((tone) => <Components.Button key={`${variant}-${tone}`} variant={variant} tone={tone}>Button</Components.Button>))}</div>;
    case "IconButton": return <Components.IconButton aria-label="Example icon action" icon="●" />;
    case "Card": return <Components.Card>Card content</Components.Card>;
    case "CardGrid": return <Components.CardGrid><Components.Card>One</Components.Card><Components.Card>Two</Components.Card></Components.CardGrid>;
    case "Panel": return <Components.Panel>Panel content</Components.Panel>;
    case "Badge": return <div className="docs-preview-row">{(["neutral", "accent", "info", "success", "warning", "danger"] as const).map((tone) => <Components.Badge key={tone} tone={tone}>Badge</Components.Badge>)}</div>;
    case "StatusBadge": return <Components.StatusBadge status="running" icon="●" label="Running" />;
    case "SeverityTag": return <Components.SeverityTag severity="destructive" icon="●" label="Destructive" />;
    case "Table": return <Components.Table caption="Example table"><Components.Table.Head><Components.Table.Row><Components.Table.HeaderCell>Name</Components.Table.HeaderCell></Components.Table.Row></Components.Table.Head><Components.Table.Body><Components.Table.Row><Components.Table.Cell>Value</Components.Table.Cell></Components.Table.Row></Components.Table.Body></Components.Table>;
    case "Timeline": return <Components.Timeline><Components.Timeline.Step marker="1">Step</Components.Timeline.Step></Components.Timeline>;
    case "CodeBlock": return <Components.CodeBlock language="tsx" code="&lt;Button&gt;Save&lt;/Button&gt;" />;
    case "Kbd": return <Components.Kbd>Esc</Components.Kbd>;
    case "Dialog": return <Components.Dialog.Root><Components.Dialog.Trigger>Open dialog</Components.Dialog.Trigger><Components.Dialog.Content><Components.Dialog.Title>Dialog</Components.Dialog.Title><Components.Dialog.Description>Example dialog.</Components.Dialog.Description></Components.Dialog.Content></Components.Dialog.Root>;
    case "Drawer": return <Components.Drawer.Root><Components.Drawer.Trigger>Open drawer</Components.Drawer.Trigger><Components.Drawer.Content><Components.Drawer.Title>Drawer</Components.Drawer.Title></Components.Drawer.Content></Components.Drawer.Root>;
    case "Tooltip": return <Components.Tooltip.Provider><Components.Tooltip.Root><Components.Tooltip.Trigger>Tooltip trigger</Components.Tooltip.Trigger><Components.Tooltip.Content>Tooltip</Components.Tooltip.Content></Components.Tooltip.Root></Components.Tooltip.Provider>;
    case "DropdownMenu": return <Components.DropdownMenu.Root><Components.DropdownMenu.Trigger>Menu trigger</Components.DropdownMenu.Trigger><Components.DropdownMenu.Content><Components.DropdownMenu.Item>Item</Components.DropdownMenu.Item></Components.DropdownMenu.Content></Components.DropdownMenu.Root>;
    case "Field": return <Components.Field label="Field"><Components.TextField /></Components.Field>;
    case "TextField": return <Components.TextField aria-label="Example text field" placeholder="Text field" />;
    case "TextArea": return <Components.TextArea aria-label="Example text area" placeholder="Text area" />;
    case "Select": return <Components.Select.Root defaultValue="one"><Components.Select.Trigger aria-label="Example select"><Components.Select.Value /></Components.Select.Trigger><Components.Select.Content><Components.Select.Item value="one">One</Components.Select.Item></Components.Select.Content></Components.Select.Root>;
    case "Switch": return <Components.Switch aria-label="Example switch" defaultChecked />;
    case "Checkbox": return <Components.Checkbox aria-label="Example checkbox" defaultChecked />;
    case "Banner": return <Components.Banner tone="info">Banner content</Components.Banner>;
    case "EmptyState": return <Components.EmptyState title="Nothing here" description="Example empty state." />;
    case "Meter": return <Components.Meter aria-label="Example meter" value={60} valueText="60%" />;
    case "ProgressRing": return <Components.ProgressRing aria-label="Example progress" value={60} valueText="60%" />;
    case "Spinner": return <Components.Spinner label="Loading" />;
    default: throw new Error(`Unknown component preview: ${name}`);
  }
}

export function CatalogIndex() {
  return <section className="cdt-page" aria-labelledby="components-title"><div><p className="docs-eyebrow">Components</p><h1 id="components-title">Components</h1><p className="docs-lead">Every public @conductor/react component is rendered from its generated metadata.</p></div><div className="cdt-card-grid">{componentMeta.map((component) => <Components.Card as="a" href={`/components/${component.name}`} key={component.name}><h2>{component.name}</h2><PreviewBoundary><div className="docs-preview" aria-label={`${component.name} preview`}><ComponentPreview name={component.name} /></div></PreviewBoundary></Components.Card>)}</div></section>;
}

export function ComponentDetail({ name, forceCopyUnavailable = false }: { readonly name: string; readonly forceCopyUnavailable?: boolean }) {
  const component = componentMeta.find((entry) => entry.name === name);
  if (component === undefined) return <Components.EmptyState title="Component not found" description={`No public component named ${name} exists.`} action={<Link to="/components">Return to components</Link>} />;
  return <section className="cdt-page" aria-labelledby="component-title"><div><p className="docs-eyebrow">Component</p><h1 id="component-title">{component.name}</h1></div><Components.Panel as="section"><h2>Live preview</h2><PreviewBoundary><div className="docs-preview"><ComponentPreview name={component.name} /></div></PreviewBoundary></Components.Panel><Components.Table caption={`${component.name} props`}><Components.Table.Head><Components.Table.Row><Components.Table.HeaderCell>Prop</Components.Table.HeaderCell><Components.Table.HeaderCell>Required</Components.Table.HeaderCell><Components.Table.HeaderCell>Type</Components.Table.HeaderCell></Components.Table.Row></Components.Table.Head><Components.Table.Body>{component.props.map((prop) => <Components.Table.Row key={prop.name}><Components.Table.Cell><code>{prop.name}</code></Components.Table.Cell><Components.Table.Cell>{prop.required ? "Yes" : "No"}</Components.Table.Cell><Components.Table.Cell><code>{prop.type}</code></Components.Table.Cell></Components.Table.Row>)}</Components.Table.Body></Components.Table><CopyCode code={`import { ${component.name} } from "@conductor/react";`} forceUnavailable={forceCopyUnavailable} /></section>;
}
