// Bundles `@conductor-by-89soone/react` into ONE classic script that reads `window.React` /
// `window.ReactDOM` and assigns `window.Conductor`, the form a Claude Design System artifact loads
// before every component preview.

/** Bare specifiers answered by the page's globals instead of bundled copies. */
const GLOBAL_MODULES = {
  react: "window.React",
  "react-dom": "window.ReactDOM",
  "react-dom/client": "window.ReactDOM",
};

/** The automatic JSX runtime, shimmed over `React.createElement`. */
const JSX_RUNTIME_SHIM = `const R=window.React;function j(t,p,k){const{children,...r}=p||{};if(k!==undefined)r.key=k;return children===undefined?R.createElement(t,r):Array.isArray(children)?R.createElement(t,r,...children):R.createElement(t,r,children);}module.exports={jsx:j,jsxs:j,jsxDEV:j,Fragment:R.Fragment};`;

export const reactGlobalsPlugin = {
  name: "react-globals",
  setup(build) {
    build.onResolve({ filter: /^(react|react-dom|react-dom\/client|react\/jsx-runtime|react\/jsx-dev-runtime)$/ }, (args) => ({ path: args.path, namespace: "react-globals" }));
    build.onLoad({ filter: /.*/, namespace: "react-globals" }, (args) => ({
      contents: args.path.startsWith("react/jsx") ? JSX_RUNTIME_SHIM : `module.exports=${GLOBAL_MODULES[args.path]};`,
      loader: "js",
    }));
  },
};

/** Lucide icons exposed as `Conductor.Icons`: the eleven canonical status/severity icons and a few the previews use. */
export const PREVIEW_ICONS = ["CircleDashed", "Loader", "PauseCircle", "CheckCircle2", "AlertCircle", "XCircle", "CircleSlash", "Eye", "Pencil", "Trash2", "ShieldX", "Search", "Plus", "Settings", "Folder", "FileText", "Copy", "ChevronRight", "Bot", "Wrench"];

export const entrySource = ({ reactEntry, tokensEntry }) => `export * from ${JSON.stringify(reactEntry)};
export { STATUS_ICONS, SEVERITY_ICONS } from ${JSON.stringify(tokensEntry)};
import { ${PREVIEW_ICONS.join(", ")} } from "lucide-react";
export const Icons = { ${PREVIEW_ICONS.join(", ")} };
`;

export const bundleHeader = (namespace, componentNames) =>
  `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace, components: componentNames.map((name) => ({ name })) })} */\n`;

/** A script the artifact inlines must not be able to close its `<script>` or open a comment. */
export function assertInlineSafeScript(source, label) {
  if (/<\/script|<!--/i.test(source)) throw new Error(`${label} contains </script or <!-- and cannot be inlined`);
  return source;
}

/**
 * @param {typeof import("esbuild")} esbuild
 * @param {{reactEntry: string, tokensEntry: string, nodePaths: string[], resolveDir: string}} options
 */
export async function bundleComponents(esbuild, { reactEntry, tokensEntry, nodePaths, resolveDir }) {
  const result = await esbuild.build({
    stdin: { contents: entrySource({ reactEntry, tokensEntry }), resolveDir, loader: "js" },
    bundle: true,
    format: "iife",
    globalName: "Conductor",
    minify: true,
    write: false,
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [reactGlobalsPlugin],
    nodePaths,
    target: "es2020",
    legalComments: "none",
    logLevel: "warning",
  });
  return assertInlineSafeScript(result.outputFiles[0].text, "bundle.js");
}
