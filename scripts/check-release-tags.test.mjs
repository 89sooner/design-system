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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, chmodSync, rmSync } from "node:fs";
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

/** 발행 전 레지스트리 상태를 흉내낸다. `published: true`면 이번 실행이 그 패키지를 건너뛴다. */
const snapshot = (repo, entries) => {
  const file = join(repo, "published-before.json");
  const body = {};
  for (const [name, published] of Object.entries(entries)) {
    const version = JSON.parse(readFileSync(join(repo, `packages/${name}/package.json`), "utf8")).version;
    body[`@conductor-by-89soone/${name}`] = { version, published };
  }
  writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
  return file;
};

const run = (repo, snapshotFile = null, extra = {}) => {
  const args = ["scripts/check-release-tags.mjs"];
  if (snapshotFile !== null) args.push("--published-before", snapshotFile);
  try {
    return { ok: true, output: execFileSync("node", args, { cwd: repo, encoding: "utf8", ...extra }) };
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ""}\n${error.stderr ?? ""}` };
  }
};

/**
 * `npm` 대역. `published`에 있는 이름만 버전을 답하고, 나머지는 npm이 실제로 내는 404 형태로
 * 실패한다. `failWith`를 주면 404가 아닌 실패를 흉내낸다.
 */
const fakeNpm = (repo, { published = [], failWith = null } = {}) => {
  const dir = mkdtempSync(join(root, "npmbin-"));
  const list = published.join(" ");
  const body =
    failWith === null
      ? `#!/usr/bin/env bash\nspec="$2"\nfor p in ${list}; do [ "$spec" = "$p" ] && { echo "\${spec##*@}"; exit 0; }; done\n` +
        `echo "npm error code E404" >&2\necho "npm error 404 Not Found" >&2\nexit 1\n`
      : `#!/usr/bin/env bash\necho "npm error code ${failWith}" >&2\necho "npm error ${failWith} Forbidden" >&2\nexit 1\n`;
  writeFileSync(join(dir, "npm"), body);
  chmodSync(join(dir, "npm"), 0o755);
  return dir;
};

const snapshotRun = (repo, npmBin, outFile) => {
  try {
    return {
      ok: true,
      output: execFileSync("node", ["scripts/check-release-tags.mjs", "--snapshot", outFile], {
        cwd: repo,
        encoding: "utf8",
        env: { ...process.env, PATH: `${npmBin}:${process.env.PATH ?? ""}` },
      }),
    };
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

describe("발행 스냅숏이 있으면 소유를 실측으로 가른다 (DEV-041)", () => {
  /*
   * manifest 동일성만으로는 답하지 못하는 자리가 있다 (PR #24 리뷰 P1): 버전이 오른 뒤
   * npm에 아직 없는 채로 main이 전진하면, bump 커밋에 남은 태그와 실제로 발행되는
   * HEAD 내용이 갈린다. 두 커밋 다 같은 버전을 선언하므로 옛 판정은 통과시켰다.
   */
  it("이번 실행이 발행한 패키지의 태그가 옛 커밋에 있으면 잡는다", () => {
    const repo = makeRepo();
    const bump = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "bump to 0.3.1");
    tag(repo, "css", "0.3.1", bump);
    tag(repo, "react", "0.3.1", bump);
    tag(repo, "tokens", "0.3.0", bump);
    // 버전은 그대로인 채 소스가 더 움직인다 — 발행되는 것은 이 트리다.
    writeFileSync(join(repo, "packages/css/src.txt"), "changed after the bump\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "source moves after the bump");

    // 셋 다 레지스트리에 없다 = 이번 실행이 전부 발행한다.
    const file = snapshot(repo, { tokens: false, css: false, react: false });
    const result = run(repo, file);
    expect(result.ok).toBe(false);
    expect(result.output).toContain("this run published this version");
    expect(result.output).toContain("css@0.3.1");
  });

  it("이번 실행이 건너뛴 패키지의 태그는 옛 커밋이어도 통과한다", () => {
    const repo = makeRepo();
    const first = commitVersions(repo, { tokens: "0.3.0", css: "0.3.0", react: "0.3.0" }, "release 0.3.0");
    for (const name of PACKAGES) tag(repo, name, "0.3.0", first);
    const second = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "release 0.3.1");
    tag(repo, "css", "0.3.1", second);
    tag(repo, "react", "0.3.1", second);

    // tokens 0.3.0은 이미 레지스트리에 있다 = 이번 실행이 건너뛴다.
    const file = snapshot(repo, { tokens: true, css: false, react: false });
    const result = run(repo, file);
    expect(result.ok).toBe(true);
    expect(result.output).not.toContain("fallback");
  });

  it("스냅숏이 없으면 약한 판정으로 물러서고 그 사실을 말한다", () => {
    const repo = makeRepo();
    const first = commitVersions(repo, { tokens: "0.3.0", css: "0.3.0", react: "0.3.0" }, "release 0.3.0");
    for (const name of PACKAGES) tag(repo, name, "0.3.0", first);
    const second = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "release 0.3.1");
    tag(repo, "css", "0.3.1", second);
    tag(repo, "react", "0.3.1", second);

    const result = run(repo);
    expect(result.ok).toBe(true);
    expect(result.output).toContain("manifest-equality fallback");
  });
});

describe("발행 전 게이트 (DEV-042)", () => {
  /*
   * 발행 뒤의 검사는 이 경우를 잡아도 늦다 (PR #25 리뷰 P1): tarball이 이미 레지스트리에
   * 올라갔고 npm은 같은 버전을 다시 받지 않으므로 고친 소스로 재발행할 수도 없다.
   */
  it("이번 실행이 발행할 패키지에 낡은 태그가 있으면 발행 전에 막는다", () => {
    const repo = makeRepo();
    const bump = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "bump");
    tag(repo, "tokens", "0.3.0", bump);
    tag(repo, "css", "0.3.1", bump);
    tag(repo, "react", "0.3.1", bump);
    writeFileSync(join(repo, "packages/css/src.txt"), "moved after the bump\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "source moves");

    // tokens@0.3.0만 레지스트리에 있다 — css·react는 이번 실행이 발행한다.
    const npmBin = fakeNpm(repo, { published: ["@conductor-by-89soone/tokens@0.3.0"] });
    const result = snapshotRun(repo, npmBin, join(repo, "snap.json"));
    expect(result.ok).toBe(false);
    expect(result.output).toContain("stale tag(s) before publishing");
    expect(result.output).toContain("css@0.3.1");
    expect(result.output).not.toContain("tokens@0.3.0"); // 건너뛸 패키지는 대상이 아니다
  });

  it("정상이면 스냅숏을 쓰고 무엇을 건너뛰는지 말한다", () => {
    const repo = makeRepo();
    const head = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "bump");
    tag(repo, "tokens", "0.3.0", head);
    const npmBin = fakeNpm(repo, { published: ["@conductor-by-89soone/tokens@0.3.0"] });
    const out = join(repo, "snap.json");
    const result = snapshotRun(repo, npmBin, out);
    expect(result.ok).toBe(true);
    expect(result.output).toContain("already on the registry");
    const snap = JSON.parse(readFileSync(out, "utf8"));
    expect(snap["@conductor-by-89soone/tokens"].published).toBe(true);
    expect(snap["@conductor-by-89soone/css"].published).toBe(false);
  });

  it("발행할 패키지의 태그가 HEAD의 가벼운 태그여도 발행 전에 막는다", () => {
    const repo = makeRepo();
    const head = commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "bump");
    tag(repo, "tokens", "0.3.0", head);
    // 현재 버전 이름의 lightweight 태그가 이미 HEAD에 있다 — Changesets는 이것을 대체하지 못한다.
    git(repo, "tag", "@conductor-by-89soone/css@0.3.1", head);
    const npmBin = fakeNpm(repo, { published: ["@conductor-by-89soone/tokens@0.3.0"] });
    const result = snapshotRun(repo, npmBin, join(repo, "snap.json"));
    expect(result.ok).toBe(false);
    expect(result.output).toContain("stale tag(s) before publishing");
    expect(result.output).toContain("not an annotated tag object");
  });

  it("404가 아닌 레지스트리 오류에는 스냅숏을 중단한다", () => {
    const repo = makeRepo();
    commitVersions(repo, { tokens: "0.3.0", css: "0.3.1", react: "0.3.1" }, "bump");
    const npmBin = fakeNpm(repo, { failWith: "E403" });
    const result = snapshotRun(repo, npmBin, join(repo, "snap.json"));
    expect(result.ok).toBe(false);
    expect(result.output).toContain("registry lookup failed");
    expect(result.output).toContain("E403");
  });
});
