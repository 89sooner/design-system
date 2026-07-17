#!/usr/bin/env node
// Refs: WP-027 FR-DX-005 JOB-REL-001
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BOT_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";
const VERSION_SUBJECT = /^Version packages(?: \(#\d+\))?$/;
const CHANGESET_PATH = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;
const PACKAGE_PATH = /^packages\/(tokens|css|react)\/(package\.json|CHANGELOG\.md)$/;
const quiet = process.argv.includes("--quiet");
const refFlag = process.argv.indexOf("--ref");
const ref = refFlag === -1 ? "HEAD" : process.argv[refFlag + 1];

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trimEnd();
}

function reject(reason) {
  if (!quiet) console.log(`[version-commit] not classified: ${reason}`);
  process.exit(1);
}

if (ref === undefined || ref.trim() === "") reject("--ref requires a git revision");

const [subject, authorEmail] = git(["show", "-s", "--format=%s%n%ae", ref]).split("\n");
if (!VERSION_SUBJECT.test(subject)) reject(`unexpected subject: ${subject}`);
if (authorEmail !== BOT_EMAIL) reject(`unexpected author: ${authorEmail}`);

const changedPackages = new Set();
const changedChangelogs = new Set();
let deletedChangesets = 0;
const lines = git(["diff-tree", "--root", "--no-commit-id", "--name-status", "--no-renames", "-r", ref]).split("\n").filter(Boolean);

for (const line of lines) {
  const [status, path] = line.split("\t");
  if (status === "D" && CHANGESET_PATH.test(path)) {
    deletedChangesets += 1;
    continue;
  }

  const packageMatch = path.match(PACKAGE_PATH);
  if (packageMatch === null) reject(`unexpected path: ${line}`);
  const [, packageDir, filename] = packageMatch;
  if (filename === "package.json" && status === "M") {
    changedPackages.add(packageDir);
    continue;
  }
  if (filename === "CHANGELOG.md" && (status === "A" || status === "M")) {
    changedChangelogs.add(packageDir);
    continue;
  }
  reject(`unexpected package change: ${line}`);
}

if (deletedChangesets === 0) reject("no consumed changeset was deleted");
if (changedPackages.size === 0) reject("no package manifest version changed");
for (const packageDir of changedPackages) {
  if (!changedChangelogs.has(packageDir)) reject(`packages/${packageDir}/CHANGELOG.md did not change`);
}
for (const packageDir of changedChangelogs) {
  if (!changedPackages.has(packageDir)) reject(`packages/${packageDir}/package.json did not change`);
}

console.log(`[version-commit] verified ${ref}: ${changedPackages.size} package(s), ${deletedChangesets} consumed changeset(s)`);
