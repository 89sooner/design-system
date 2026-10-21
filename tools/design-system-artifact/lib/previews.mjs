// Component previews for the artifact, taken from the docs catalog (`apps/docs/src/catalog.tsx`):
// the same synthetic examples the docs site renders, compiled once and inlined into each
// `components/<Name>/preview.html`.

const PREVIEW_START = "const previewOptions";
const PREVIEW_FUNCTION = "export function ComponentPreview";
const PREVIEW_DEFAULT = "default: throw new Error(`Unknown component preview";

/** Row heights (px) for previews taller than the default; the artifact grows a row to fit. */
export const PREVIEW_HEIGHTS = {
  Button: 200, Table: 230, Timeline: 170, Dialog: 120, AlertDialog: 140, Select: 160, DatePicker: 160,
  AppShell: 380, AppShellNavTrigger: 380, NavList: 140, TopBar: 140, WorkbenchLayout: 330, DataTable: 330,
  DetailInspector: 220, Conversation: 300, Message: 200, PromptInput: 180, Tool: 260, Confirmation: 200,
  Sources: 160, ProcessingStatus: 220, RelationGraph: 360, CardGrid: 200, Banner: 140, EmptyState: 240,
  Combobox: 170, MultiSelect: 200, PathList: 200, CommandPalette: 120, RadioGroup: 220, Field: 150,
  TextField: 150, TextArea: 190, Checkbox: 150, NumberInput: 150, Card: 170, Panel: 170, Tabs: 150,
  Reasoning: 120, Suggestions: 130,
};
export const DEFAULT_PREVIEW_HEIGHT = 130;

/** The docs-only layout classes the catalog previews use. */
export const PREVIEW_CLASSES = ["docs-agent-conversation", "docs-agent-stack", "docs-avatar-row", "docs-button-matrix", "docs-dialog-actions", "docs-meter", "docs-preview-card", "docs-preview-meta", "docs-preview-row", "docs-preview-value", "docs-setting-row"];

const PRELUDE = `const Components: any = (window as any).Conductor;
const React: any = (window as any).React;
const { useState, useRef, Component } = React;
const createPortal = (window as any).ReactDOM.createPortal;
type ReactNode = any;
const Link = ({ to, ...props }: any) => <a href={"https://89sooner.github.io/design-system" + to} {...props} />;
`;

const RENDER = `
(window as any).CdtPreview = {
  render(name: string, element: Element) {
    const ReactDOM = (window as any).ReactDOM;
    const node = <ComponentPreview name={name} />;
    if (typeof ReactDOM.createRoot === "function") ReactDOM.createRoot(element).render(node);
    else ReactDOM.render(node, element);
  },
};
`;

function indexOrThrow(source, needle, from = 0) {
  const index = source.indexOf(needle, from);
  if (index === -1) throw new Error(`catalog.tsx no longer contains ${JSON.stringify(needle)}; update lib/previews.mjs`);
  return index;
}

/** The preview helpers and the `ComponentPreview` switch, cut out of catalog.tsx. */
export function extractPreviewSource(catalog) {
  const start = indexOrThrow(catalog, PREVIEW_START);
  const fn = indexOrThrow(catalog, PREVIEW_FUNCTION, start);
  const fallback = indexOrThrow(catalog, PREVIEW_DEFAULT, fn);
  const end = indexOrThrow(catalog, "\n}\n", fallback) + 3;
  return catalog.slice(start, end).replace(PREVIEW_FUNCTION, "function ComponentPreview");
}

export const previewModuleSource = (catalog) => PRELUDE + extractPreviewSource(catalog) + RENDER;

/** @param {typeof import("esbuild")} esbuild */
export async function compilePreviews(esbuild, catalog) {
  const result = await esbuild.transform(previewModuleSource(catalog), {
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    minify: true,
    target: "es2020",
    legalComments: "none",
  });
  return `(()=>{${result.code}})();`;
}

/**
 * Rules whose every selector is one of `classNames`, optionally followed by one element
 * (`.docs-preview-card strong`). Rules that scope a class under another (`.docs-console .docs-setting-row`)
 * belong to other docs pages and are left out.
 */
export function pickRules(stylesheets, classNames) {
  const own = new RegExp(`^\\.(${classNames.join("|")})(\\s+[a-z]+)?$`);
  return stylesheets
    .map((css) => css.replace(/\/\*[\s\S]*?\*\//g, ""))
    .flatMap((css) => [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)])
    .map(([, selector, body]) => [selector.trim(), body.trim().replace(/\s+/g, " ")])
    .filter(([selector]) => selector.split(",").every((part) => own.test(part.trim())))
    .map(([selector, body]) => `${selector}{${body}}`)
    .join("");
}

export const previewHtml = ({ name, group, height, script, css }) => `<!-- @dsCard group="${group}" height=${height} -->
<!doctype html>
<html><head><meta charset="utf-8"><style>body{margin:0;padding:var(--cdt-space-5);background:var(--cdt-surface-base)}${css}</style></head>
<body><div id="root"></div>
<script>${script}
CdtPreview.render(${JSON.stringify(name)}, document.getElementById("root"));</script></body></html>
`;
