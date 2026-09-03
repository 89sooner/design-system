#!/usr/bin/env node
// Refs: WP-027 FR-DX-005 JOB-REL-001
// Changesets can report a successful publish even when annotated tag creation
// fails. Treat each package manifest's current release tag as a required
// artifact, and optionally prove that the same tag object reached the remote.
//
// This runs in the release job only, right after `changeset publish`, where HEAD is the commit
// that was published and the tags were just created on it. Running it anywhere else reports the
// distance between the last release and the working branch — that is the question it asks, and
// outside a release the answer is expected to be non-zero.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_DIRS = ["packages/tokens", "packages/css", "packages/react"];

function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", allowFailure ? "ignore" : "inherit"],
    }).trim();
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

function parseRemote(argv) {
  const index = argv.indexOf("--remote");
  if (index === -1) return null;
  const remote = argv[index + 1];
  if (remote === undefined || remote.startsWith("--")) {
    console.error("usage: node scripts/check-release-tags.mjs [--remote <name>]");
    process.exit(2);
  }
  return remote;
}

const remote = parseRemote(process.argv.slice(2));
const head = git(["rev-parse", "HEAD"]);
const problems = [];

for (const packageDir of PACKAGE_DIRS) {
  const manifest = JSON.parse(await readFile(resolve(ROOT, packageDir, "package.json"), "utf8"));
  const tag = `${manifest.name}@${manifest.version}`;
  const ref = `refs/tags/${tag}`;
  const localObject = git(["rev-parse", "--verify", ref], { allowFailure: true });

  if (localObject === null) {
    problems.push(`${tag}: local tag is missing`);
    continue;
  }

  const objectType = git(["cat-file", "-t", localObject]);
  if (objectType !== "tag") {
    problems.push(`${tag}: expected an annotated tag object, got ${objectType}`);
    continue;
  }

  const target = git(["rev-list", "-n", "1", ref]);
  const isReachable = git(["merge-base", "--is-ancestor", target, head], { allowFailure: true }) !== null;
  if (!isReachable) {
    problems.push(`${tag}: target ${target} is not an ancestor of release HEAD ${head}`);
  } else if (target !== head) {
    /*
     * The tag must name the commit whose contents were published (PR #3 review P1, PR #12 review P1).
     *
     * `--is-ancestor` asks whether one commit precedes another and nothing more. When a tag-push run
     * supplies an annotated tag for the current version on an older commit and `main` has since
     * advanced, Changesets publishes while its attempt to recreate the existing tag fails silently —
     * and both checks here pass, because the stale object is an ancestor and the same object already
     * reached the remote. The published artifact then carries a release tag that identifies
     * different source.
     *
     * Comparing only the package's own directory does not close that gap: the CSS build embeds the
     * tokens output, and every build reads root inputs such as `pnpm-lock.yaml`, so a tarball can
     * change without a single file under `packages/<name>/` moving.
     *
     * **A package that did not take a version bump is not part of this release** (DEV-040). `linked`
     * means the three packages share a number when they move together, not that they always move —
     * 0.3.1 raised `css` and `react` while `tokens` stayed at 0.3.0 because nothing under it changed.
     * `changeset publish` only publishes versions absent from the registry, so that package is not
     * republished here and its tag rightly names the earlier release commit. Requiring release HEAD
     * for it rejected a legitimate patch release and left the run failing *after* npm had already
     * accepted the two packages that did move.
     *
     * The question that separates the two cases needs no network: does the tag's own commit already
     * carry this version in the package manifest? If it does, that release produced this version and
     * the tag names its source correctly. If it does not, the tag was placed on a commit that never
     * declared this version — the failure mode above.
     */
    const manifestAtTarget = git(["show", `${target}:${packageDir}/package.json`], { allowFailure: true });
    const versionAtTarget = manifestAtTarget === null ? null : JSON.parse(manifestAtTarget).version;
    if (versionAtTarget !== manifest.version) {
      problems.push(
        `${tag}: target ${target} declares version ${versionAtTarget ?? "(no manifest)"}, not ${manifest.version} — ` +
          "the tag names a commit that never carried this version",
      );
    }
  }

  if (remote !== null) {
    const line = git(["ls-remote", "--refs", remote, ref], { allowFailure: true });
    const remoteObject = line?.split(/\s+/, 1)[0];
    if (remoteObject === undefined || remoteObject === "") {
      problems.push(`${tag}: remote ${remote} tag is missing`);
    } else if (remoteObject !== localObject) {
      problems.push(`${tag}: remote ${remote} object ${remoteObject} differs from local ${localObject}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`error[RELEASE-TAG]: ${problems.length} violation(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `[check:release-tags] ${PACKAGE_DIRS.length} annotated package tag(s) verified${remote === null ? " locally" : ` locally and on ${remote}`}`,
);
