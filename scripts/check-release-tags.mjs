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
     * The tag must name the commit that was published (PR #3 review P1, PR #12 review P1).
     *
     * `--is-ancestor` asks whether one commit precedes another and nothing more. When a tag-push run
     * supplies an annotated tag for the current version on an older commit and `main` has since
     * advanced without another version bump, Changesets publishes the newer contents while its
     * attempt to recreate the existing tag fails silently — and both checks here pass, because the
     * stale object is an ancestor and the same object already reached the remote. The published
     * artifact then carries a release tag that identifies different source.
     *
     * Comparing only the package's own directory does not close that gap: the CSS build embeds the
     * tokens output, and every build reads root inputs such as `pnpm-lock.yaml`, so a tarball can
     * change without a single file under `packages/<name>/` moving. Enumerating "all inputs capable
     * of affecting the artifact" is a list that goes stale the first time the build graph changes,
     * and a list that must stay complete to stay correct is the wrong shape for this check.
     *
     * `changeset publish` publishes the working tree at release HEAD, so requiring the tag to point
     * there needs no such list. The three packages are `linked` in the Changesets config and take a
     * version together, so this rejects no legitimate release — a package that did not change gets
     * a tag at the same commit as the others.
     */
    problems.push(
      `${tag}: target ${target} is not release HEAD ${head} — ` +
        "the published artifact and the tag would identify different source",
    );
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
