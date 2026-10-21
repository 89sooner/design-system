// Per-component guidelines and the types file, from what the docs build already generates.

const escapeCell = (text) => text.replaceAll("|", "\\|");

function propsTable({ props, propsTypeName }) {
  if (props.length === 0) return "";
  const rows = props.map(({ name, type, required }) => `| \`${name}\` | \`${escapeCell(type)}\` | ${required ? "yes" : ""} |`);
  return `\n## Props (\`${propsTypeName}\`)\n\n| Prop | Type | Required |\n| --- | --- | --- |\n${rows.join("\n")}\n`;
}

const bullets = (lines) => lines.map((line) => `- ${line}`).join("\n");

function keyboardSection(keyboard) {
  if (keyboard === "static") return "No keyboard interaction of its own; focusable content inside keeps its native behaviour.";
  return keyboard.map(({ keys, action }) => `- **${keys}** — ${action}`).join("\n");
}

const avoidSection = (avoid) =>
  avoid.map(({ rule, instead }) => `- ${rule}${instead === undefined ? "" : ` Use \`${instead}\` instead.`}`).join("\n");

/** `components/<Name>/README.md` from one entry of `apps/docs/src/generated/component-meta.json`. */
export const componentReadme = (meta) => {
  const { name, family, className, guidance } = meta;
  return `# ${name}

${guidance.purpose}

Root class: \`${className}\` · family: ${family} · \`window.Conductor.${name}\`

## Use

${bullets(guidance.use)}

## Avoid

${avoidSection(guidance.avoid)}

## Keyboard

${keyboardSection(guidance.keyboard)}

## Accessibility

${bullets(guidance.accessibility)}
${propsTable(meta)}`;
};

const DTS_PREAMBLE = `// @conductor-by-89soone/react public API (packages/react/etc/react.api.md, API Extractor report).
// window.Conductor also carries STATUS_ICONS / SEVERITY_ICONS (from @conductor-by-89soone/tokens) and Icons (lucide-react components used by the previews).
`;

const literalMap = (map) => `{ ${Object.entries(map).map(([key, value]) => `readonly ${key}: ${JSON.stringify(value)}`).join("; ")} }`;

/** `components/index.d.ts`: the API Extractor rollup plus the icon maps the bundle adds. */
export function toDeclarations(apiReport, { statusIcons, severityIcons }) {
  const match = apiReport.match(/```ts\n([\s\S]*)\n```/);
  if (match === null) throw new Error("react.api.md has no ```ts block");
  return `${DTS_PREAMBLE}${match[1]}
export declare const STATUS_ICONS: ${literalMap(statusIcons)};
export declare const SEVERITY_ICONS: ${literalMap(severityIcons)};
`;
}
