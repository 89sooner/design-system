/**
 * 릴리스 태그 게이트가 정상 릴리스를 막지 않으면서 어긋난 태그는 잡는다 (DEV-040).
 *
 * 0.3.1에서 `css`·`react`만 버전이 올랐고 `tokens`는 그대로였는데, 게이트가 모든
 * 패키지의 태그에 release HEAD를 요구해 실패했다 — npm이 이미 두 패키지를 받은
 * 뒤였다. `linked`는 함께 오를 때 같은 번호를 쓴다는 뜻이지 항상 함께 오른다는
 * 뜻이 아니다.
 *
 * 판정 기준은 네트워크를 타지 않는다: 태그가 가리키는 커밋의 manifest가 이미 그
 * 버전을 담고 있으면 그 릴리스가 이 버전을 만든 것이고 태그는 자기 소스를 옳게
 * 가리킨다.
 *
 * Refs: DEV-040 FR-DX-005 JOB-REL-001
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "check-release-tags.mjs");
const PACKAGES = ["tokens", "css", "react"];
let root;

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/** package.json 셋을 주어진 버전으로 쓰고 커밋한다. 반환은 그 커밋. */
const commitVersions = (repo, versions, message) => {
  for (const name of PACKAGES) {
    writeFileSync(
      join(repo, `packages/${name}/package.json`),
      `${JSON.stringify({ name: `@conductor-by-89soone/${name}`, version: versions[name] }, null, 2)}\n`,
    );
  }
  git(repo, "add", "-A");
  git(repo, "commit", "-qm", message);
  return git(repo, "rev-parse", "HEAD");
};

const makeRepo = () => {
  const repo = mkdtempSync(join(root, "repo-"));
  mkdirSync(join(repo, "scripts"), { recursive: true });
  for (const name of PACKAGES) mkdirSync(join(repo, `packages/${name}`), { recursive: true });
  copyFileSync(SCRIPT, join(repo, "scripts/check-release-tags.mjs"));
  git(repo, "init", "-q");
  git(repo, "config", "user.email", "test@example.com");
  git(repo, "config", "user.name", "test");
  git(repo, "config", "core.autocrlf", "false");
  return repo;
};

const tag = (repo, name, version, commit) =>
  git(repo, "tag", "-a", `@conductor-by-89soone/${name}@${version}`, "-m", `@conductor-by-89soone/${name}@${version}`, commit);

const run = (repo) => {
  try {
    return { ok: true, output: execFileSync("node", ["scripts/check-release-tags.mjs"], { cwd: repo, encoding: "utf8" }) };
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ""}\n${error.stderr ?? ""}` };
  }
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "cdt-release-tags-"));
});
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("릴리스 태그 게이트 (DEV-040)", () => {
  it("버전이 오르지 않은 패키지의 태그가 이전 릴리스 커밋을 가리켜도 통과한다", () => {
    const repo = makeRepo();
    const first = commitVersions(repo, { tokens: "0.3.0", css: "0.3.0", react: "0.3.0" }, "release 0.3.0");
    for (const name of PACKAGES) tag(repo, name, "0.3.0", first);
    // css·react만 오른다 — tokens는 바뀐 것이 없어 0.3.0에 머문다.
    const second = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "release 0.3.1");
    tag(repo, "css", "0.3.1", second);
    tag(repo, "react", "0.3.1", second);

    const result = run(repo);
    expect(result.output).not.toContain("tokens@0.3.0");
    expect(result.ok).toBe(true);
  });

  it("이 버전을 선언한 적 없는 커밋에 태그가 놓이면 잡는다", () => {
    const repo = makeRepo();
    const first = commitVersions(repo, { tokens: "0.3.0", css: "0.3.0", react: "0.3.0" }, "release 0.3.0");
    for (const name of PACKAGES) tag(repo, name, "0.3.0", first);
    const second = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "release 0.3.1");
    // css의 0.3.1 태그가 그 버전을 담지 않은 옛 커밋에 놓였다.
    tag(repo, "css", "0.3.1", first);
    tag(repo, "react", "0.3.1", second);

    const result = run(repo);
    expect(result.ok).toBe(false);
    expect(result.output).toContain("css@0.3.1");
    expect(result.output).toContain("declares version 0.3.0, not 0.3.1");
  });

  it("태그가 아예 없으면 잡는다", () => {
    const repo = makeRepo();
    const head = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "release");
    tag(repo, "tokens", "0.3.0", head);
    const result = run(repo);
    expect(result.ok).toBe(false);
    expect(result.output).toContain("css@0.3.1: local tag is missing");
  });

  it("가벼운 태그(annotated가 아닌)를 거부한다", () => {
    const repo = makeRepo();
    const head = commitVersions(repo, { tokens: "0.3.0", css: "0.3.0", react: "0.3.0" }, "release");
    git(repo, "tag", "@conductor-by-89soone/tokens@0.3.0", head); // lightweight
    tag(repo, "css", "0.3.0", head);
    tag(repo, "react", "0.3.0", head);
    const result = run(repo);
    expect(result.ok).toBe(false);
    expect(result.output).toContain("expected an annotated tag object");
  });
});
