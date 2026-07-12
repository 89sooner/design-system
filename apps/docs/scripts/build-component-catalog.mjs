// Refs: WP-020 FR-DOC-003 FR-DX-002
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const declarations = readFileSync(`${root}/packages/react/dist/index.d.ts`, "utf8");
const catalogSource = readFileSync(fileURLToPath(new URL("../src/catalog.tsx", import.meta.url)), "utf8");
const ignored = new Set(["CONSUMED_PACKAGES", "PACKAGE_NAME"]);
const exportBlock = declarations.match(/export \{([\s\S]+)\};\s*$/)?.[1] ?? "";
const declared = [...declarations.matchAll(/declare const (\w+):/g)].map((match) => match[1]).filter((name) => !ignored.has(name) && new RegExp(`\\b${name}\\b`).test(exportBlock));
const source = ts.createSourceFile("index.d.ts", declarations, ts.ScriptTarget.Latest, true);
const members = new Map(source.statements.filter(ts.isInterfaceDeclaration).filter((statement) => statement.name.text.endsWith("Props")).map((statement) => [statement.name.text, statement.members.filter(ts.isPropertySignature).map((property) => ({ name: property.name.getText(source).replaceAll('"', ""), required: property.questionToken === undefined, type: property.type?.getText(source) ?? "unknown" }))]));
const aliases = { Dialog: "DialogContentProps", Drawer: "DrawerContentProps", Tooltip: "TooltipContentProps", DropdownMenu: "DropdownMenuItemProps", Select: "SelectTriggerProps" };
const components = declared.map((name) => ({ name, propsTypeName: aliases[name] ?? `${name}Props`, props: members.get(aliases[name] ?? `${name}Props`) ?? [] }));
const missing = components.filter(({ name }) => !catalogSource.includes(`case "${name}"`)).map(({ name }) => name);
if (missing.length > 0) throw new Error(`error[DOC-CATALOG]: preview missing for public component(s): ${missing.join(", ")}`);
mkdirSync(fileURLToPath(new URL("../src/generated", import.meta.url)), { recursive: true });
writeFileSync(fileURLToPath(new URL("../src/generated/component-meta.json", import.meta.url)), `${JSON.stringify(components, null, 2)}\n`);
