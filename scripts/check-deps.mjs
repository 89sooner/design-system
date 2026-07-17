#!/usr/bin/env node
// Enforces the one-way package dependency direction tokens → css → react → docs.
// Refs: WP-001 FR-DX-001 (AC-1), NFR-004 (zero cyclic package dependencies), ADR-001.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The only internal edges the architecture permits. Order in the array is the build order. */
const ALLOWED_EDGES = {
  "@conductor-by-89soone/tokens": [],
  "@conductor-by-89soone/css": ["@conductor-by-89soone/tokens"],
  "@conductor-by-89soone/react": ["@conductor-by-89soone/tokens", "@conductor-by-89soone/css"],
  docs: ["@conductor-by-89soone/tokens", "@conductor-by-89soone/css", "@conductor-by-89soone/react"],
};

const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

/** Reads the `- pattern` entries out of pnpm-workspace.yaml without pulling in a YAML parser. */
function workspacePatterns() {
  const source = readFileSync(join(ROOT, "pnpm-workspace.yaml"), "utf8");
  return [...source.matchAll(/^\s*-\s*["']?([^"'\s#]+)["']?\s*$/gm)].map((match) => match[1]);
}

function workspaceManifestPaths() {
  const paths = [];
  for (const pattern of workspacePatterns()) {
    if (!pattern.endsWith("/*")) {
      const manifest = join(ROOT, pattern, "package.json");
      if (existsSync(manifest)) paths.push(manifest);
      continue;
    }
    const parent = join(ROOT, pattern.slice(0, -2));
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifest = join(parent, entry.name, "package.json");
      if (existsSync(manifest)) paths.push(manifest);
    }
  }
  return paths.sort();
}

/** @returns {Map<string, {manifestPath: string, edges: Array<{to: string, field: string}>}>} */
function readGraph(manifestPaths) {
  const internalNames = new Set();
  const manifests = manifestPaths.map((manifestPath) => {
    const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));
    internalNames.add(pkg.name);
    return { manifestPath, pkg };
  });

  const graph = new Map();
  for (const { manifestPath, pkg } of manifests) {
    const edges = [];
    for (const field of DEPENDENCY_FIELDS) {
      for (const name of Object.keys(pkg[field] ?? {})) {
        if (internalNames.has(name)) edges.push({ to: name, field });
      }
    }
    graph.set(pkg.name, { manifestPath, edges });
  }
  return graph;
}

/** @returns {string[]} the offending cycle as a node list, or an empty array. */
function findCycle(graph) {
  const state = new Map();
  const stack = [];

  function visit(name) {
    if (state.get(name) === "done") return [];
    if (state.get(name) === "open") return [...stack.slice(stack.indexOf(name)), name];
    state.set(name, "open");
    stack.push(name);
    for (const { to } of graph.get(name)?.edges ?? []) {
      const cycle = visit(to);
      if (cycle.length > 0) return cycle;
    }
    stack.pop();
    state.set(name, "done");
    return [];
  }

  for (const name of graph.keys()) {
    const cycle = visit(name);
    if (cycle.length > 0) return cycle;
  }
  return [];
}

function main() {
  const graph = readGraph(workspaceManifestPaths());
  const problems = [];
  let edgeCount = 0;

  for (const [name, { manifestPath, edges }] of graph) {
    const allowed = ALLOWED_EDGES[name];
    const where = relative(ROOT, manifestPath);

    if (allowed === undefined) {
      problems.push(
        `error[DEP_UNKNOWN_PACKAGE]: ${name}\n` +
          `  ${where} is a workspace member with no entry in the allowed-edge table.\n` +
          `  hint: add it to ALLOWED_EDGES in scripts/check-deps.mjs, or remove the package.`,
      );
      continue;
    }

    for (const { to, field } of edges) {
      edgeCount += 1;
      if (allowed.includes(to)) continue;
      problems.push(
        `error[DEP_DIRECTION]: ${name} -> ${to}\n` +
          `  ${where} declares "${to}" in ${field}.\n` +
          `  allowed edges from ${name}: ${allowed.length > 0 ? allowed.join(", ") : "(none)"}\n` +
          `  hint: the dependency direction is tokens → css → react → docs (FR-DX-001 AC-1).`,
      );
    }
  }

  const cycle = findCycle(graph);
  if (cycle.length > 0) {
    problems.push(
      `error[DEP_CYCLE]: ${cycle.join(" → ")}\n` +
        `  hint: workspace package dependencies must form a directed acyclic graph (NFR-004).`,
    );
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(problem);
    console.error(`\n[check-deps] ${problems.length} violation(s)`);
    process.exit(1);
  }

  console.log(
    `[check-deps] ${graph.size} workspace packages, ${edgeCount} internal edges, 0 violations`,
  );
}

main();
