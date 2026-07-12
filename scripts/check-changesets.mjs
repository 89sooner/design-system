#!/usr/bin/env node
// Refs: WP-027 FR-DX-005 JOB-REL-001
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHANGESET_DIR = resolve(ROOT, ".changeset");
const KNOWN_PACKAGES = new Set(["@conductor/tokens", "@conductor/css", "@conductor/react"]);
const REFS_PATTERN = /^Refs:.*\b(?:WP-\d{3}|FR-[A-Z]+-\d{3}|NFR-\d{3})\b/m;
const MIGRATION_PATTERN = /^#{2,3} Migration\b|^Migration:|마이그레이션/m;
const requireEmpty = process.argv.includes("--require-empty");

function parseChangeset(name, text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (match === null) return { name, releases: null, body: text };
  const releases = [];
  for (const line of match[1].split("\n")) {
    const release = line.match(/^"?([^":]+)"?\s*:\s*(major|minor|patch)\s*$/);
    if (release !== null) releases.push({ package: release[1], bump: release[2] });
  }
  return { name, releases, body: match[2] };
}

const entries = (await readdir(CHANGESET_DIR)).filter((name) => name.endsWith(".md") && name !== "README.md");

if (requireEmpty) {
  if (entries.length > 0) {
    console.error("error[CHANGESET-PENDING]: unversioned changesets exist; run the version PR before publishing");
    for (const name of entries) console.error(`  .changeset/${name}`);
    process.exit(1);
  }
  console.log("[check:changesets] no pending changesets; safe to publish");
  process.exit(0);
}

const problems = [];
for (const name of entries) {
  const changeset = parseChangeset(name, await readFile(resolve(CHANGESET_DIR, name), "utf8"));
  if (changeset.releases === null || changeset.releases.length === 0) {
    problems.push(`.changeset/${name}: frontmatter에 영향받는 패키지와 bump 종류가 없다`);
    continue;
  }
  for (const release of changeset.releases) {
    if (!KNOWN_PACKAGES.has(release.package)) {
      problems.push(`.changeset/${name}: 배포 대상이 아닌 패키지 ${release.package}`);
    }
  }
  if (!REFS_PATTERN.test(changeset.body)) {
    problems.push(`.changeset/${name}: 본문에 WP/FR ID가 담긴 "Refs:" 줄이 없다 (FR-DX-005 AC-2)`);
  }
  const hasMajor = changeset.releases.some((release) => release.bump === "major");
  if (hasMajor && !MIGRATION_PATTERN.test(changeset.body)) {
    problems.push(`.changeset/${name}: major 변경에 마이그레이션 노트("## Migration" 절)가 없다 (FR-DX-005 AC-4)`);
  }
}

if (problems.length > 0) {
  console.error(`error[CHANGESET-CONVENTION]: ${problems.length} violation(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`[check:changesets] ${entries.length} changeset(s), 0 violation(s)`);
