// Refs: WP-020 CR-042 FR-DOC-003 FR-DX-002 W-020
//
// Emits `src/generated/component-meta.json`: one entry per public `@conductor-by-89soone/react`
// component with its props (read from the built declarations), the catalog family it is filed
// under and the root `cdt-*` class a framework-agnostic consumer writes by hand. The two maps below
// are the only hand-maintained part; every other field is derived, and a public export that is
// missing from either map fails the docs build rather than rendering an unfiled tile.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const declarationsDirectory = `${root}/packages/react/dist`;
const publicDeclarations = readFileSync(`${declarationsDirectory}/index.d.ts`, "utf8");
const declarations = readdirSync(declarationsDirectory)
  .filter((name) => name.endsWith(".d.ts"))
  .map((name) => readFileSync(`${declarationsDirectory}/${name}`, "utf8"))
  .join("\n");
const stylesheet = readFileSync(`${root}/packages/css/dist/index.css`, "utf8");
const catalogSource = readFileSync(fileURLToPath(new URL("../src/catalog.tsx", import.meta.url)), "utf8");

/**
 * Catalog families (W-020), in display order; members in display order within each family.
 * The catalog groups tiles by this list, so the order here is the order on the screen.
 */
const FAMILIES = [
  ["Actions", ["Button", "IconButton"]],
  ["Surfaces", ["Card", "CardGrid", "Panel"]],
  ["Status", ["Badge", "StatusBadge", "SeverityTag"]],
  ["Data", ["Table", "Timeline", "CodeBlock", "Kbd"]],
  ["Overlays", ["Dialog", "Drawer", "Tooltip", "DropdownMenu", "Popover"]],
  ["Forms", ["Field", "TextField", "TextArea", "Select", "Switch", "Checkbox"]],
  ["Feedback", ["Banner", "EmptyState", "Meter", "ProgressRing", "Spinner", "Skeleton"]],
  ["Shell", ["AppShell", "AppShellNavTrigger", "NavList", "TopBar"]],
  ["Interaction", ["Tabs", "Collapsible"]],
  ["Search workbench", ["Combobox", "MultiSelect", "FilterChip", "FilterToolbar", "DataTable", "WorkbenchLayout", "DetailInspector", "PathList", "Breadcrumb", "CopyButton"]],
  ["Relations", ["RelationGraph"]],
  ["Operations", ["ProcessingStatus"]],
];

/**
 * The root class of each component's rendered element (FR-CSS-004: the class contract that
 * reproduces the React component without React). Compound components name the part a consumer
 * styles first. Every class is checked against the built stylesheet so a rename in `packages/css`
 * cannot leave the detail screen quoting a class that no longer exists.
 */
const ROOT_CLASSES = {
  Button: "cdt-btn",
  IconButton: "cdt-btn cdt-btn--icon",
  Card: "cdt-card",
  CardGrid: "cdt-card-grid",
  Panel: "cdt-panel",
  Badge: "cdt-badge",
  StatusBadge: "cdt-badge cdt-status-badge",
  SeverityTag: "cdt-badge cdt-severity-tag",
  Table: "cdt-table",
  Timeline: "cdt-timeline",
  CodeBlock: "cdt-code-block",
  Kbd: "cdt-kbd",
  Dialog: "cdt-dialog",
  Drawer: "cdt-drawer",
  Tooltip: "cdt-tooltip",
  DropdownMenu: "cdt-menu",
  Popover: "cdt-popover",
  Field: "cdt-field",
  TextField: "cdt-input",
  TextArea: "cdt-textarea",
  Select: "cdt-select__trigger",
  Switch: "cdt-switch",
  Checkbox: "cdt-checkbox",
  Banner: "cdt-banner",
  EmptyState: "cdt-empty-state",
  Meter: "cdt-meter",
  ProgressRing: "cdt-progress-ring",
  Spinner: "cdt-spinner",
  Skeleton: "cdt-skeleton",
  AppShell: "cdt-app-shell",
  AppShellNavTrigger: "cdt-btn cdt-btn--ghost",
  NavList: "cdt-nav-list",
  TopBar: "cdt-topbar",
  Tabs: "cdt-tabs",
  Collapsible: "cdt-collapsible",
  Combobox: "cdt-combobox",
  MultiSelect: "cdt-multi-select",
  FilterChip: "cdt-filter-chip",
  FilterToolbar: "cdt-filter-toolbar",
  DataTable: "cdt-data-table",
  WorkbenchLayout: "cdt-workbench",
  DetailInspector: "cdt-detail-inspector",
  PathList: "cdt-path-list",
  Breadcrumb: "cdt-breadcrumb",
  CopyButton: "cdt-copy-feedback",
  RelationGraph: "cdt-relation",
  ProcessingStatus: "cdt-processing-status",
};

const ignored = new Set(["CONSUMED_PACKAGES", "PACKAGE_NAME"]);
const exported = new Set([...publicDeclarations.matchAll(/export \{([^}]+)\}/g)].flatMap((match) => match[1].split(",").map((name) => name.trim().split(/\s+as\s+/)[0])));
const declared = [...declarations.matchAll(/declare const (\w+):/g)].map((match) => match[1]).filter((name) => !ignored.has(name) && exported.has(name));
const source = ts.createSourceFile("index.d.ts", declarations, ts.ScriptTarget.Latest, true);
const members = new Map(source.statements.filter(ts.isInterfaceDeclaration).filter((statement) => statement.name.text.endsWith("Props")).map((statement) => [statement.name.text, statement.members.filter(ts.isPropertySignature).map((property) => ({ name: property.name.getText(source).replaceAll('"', ""), required: property.questionToken === undefined, type: property.type?.getText(source) ?? "unknown" }))]));
const aliases = { Dialog: "DialogContentProps", Drawer: "DrawerContentProps", Tooltip: "TooltipContentProps", DropdownMenu: "DropdownMenuItemProps", Select: "SelectTriggerProps" };

// Family lookup: name → { family, order } where `order` sorts the catalog into display order.
const placement = new Map();
FAMILIES.forEach(([family, names], familyIndex) => names.forEach((name, memberIndex) => placement.set(name, { family, order: familyIndex * 100 + memberIndex })));

const unfiled = declared.filter((name) => !placement.has(name));
if (unfiled.length > 0) throw new Error(`error[DOC-CATALOG-FAMILY]: no catalog family assigned for public component(s): ${unfiled.join(", ")}\n  hint: add each name to FAMILIES in apps/docs/scripts/build-component-catalog.mjs.`);
const stale = [...placement.keys()].filter((name) => !declared.includes(name));
if (stale.length > 0) throw new Error(`error[DOC-CATALOG-FAMILY]: FAMILIES names component(s) that are not public exports: ${stale.join(", ")}`);

const unclassed = declared.filter((name) => typeof ROOT_CLASSES[name] !== "string");
if (unclassed.length > 0) throw new Error(`error[DOC-CATALOG-CLASS]: no root class recorded for public component(s): ${unclassed.join(", ")}\n  hint: add each name to ROOT_CLASSES in apps/docs/scripts/build-component-catalog.mjs.`);
const unknownClasses = declared.flatMap((name) => ROOT_CLASSES[name].split(" ").filter((className) => !stylesheet.includes(`.${className}`)).map((className) => `${name} → .${className}`));
if (unknownClasses.length > 0) throw new Error(`error[DOC-CATALOG-CLASS]: root class not found in @conductor-by-89soone/css: ${unknownClasses.join(", ")}`);

const components = declared
  .map((name) => ({ name, family: placement.get(name).family, className: ROOT_CLASSES[name], propsTypeName: aliases[name] ?? `${name}Props`, props: members.get(aliases[name] ?? `${name}Props`) ?? [] }))
  .sort((one, other) => placement.get(one.name).order - placement.get(other.name).order);
const missing = components.filter(({ name }) => !catalogSource.includes(`case "${name}"`)).map(({ name }) => name);
if (missing.length > 0) throw new Error(`error[DOC-CATALOG]: preview missing for public component(s): ${missing.join(", ")}`);
mkdirSync(fileURLToPath(new URL("../src/generated", import.meta.url)), { recursive: true });
writeFileSync(fileURLToPath(new URL("../src/generated/component-meta.json", import.meta.url)), `${JSON.stringify(components, null, 2)}\n`);
