#!/usr/bin/env node
// Refs: WP-027 NFR-004 JOB-REL-001
// 인프라 운영 문서 §7의 롤백 절차(deprecate → dist-tag 승격 → 검증)를 실행한다.
// npm은 게시된 버전을 삭제할 수 없으므로 롤백은 태그 조작으로만 수행한다 (ADR-010).
// 기본은 dry-run이며 --execute를 명시해야 실제 npm 명령을 실행한다.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).filter((arg) => arg !== "--execute");
const execute = process.argv.includes("--execute");
const [badVersion, goodVersion, reason] = args;

if (badVersion === undefined || goodVersion === undefined) {
  console.error("usage: node scripts/release-rollback.mjs <결함 버전> <직전 정상 버전> [사유] [--execute]");
  process.exit(2);
}

const PACKAGES = ["@conductor/tokens", "@conductor/css", "@conductor/react"];
const message = reason ?? `${badVersion}에 결함이 있다. ${goodVersion}(으)로 롤백하십시오.`;
const steps = [
  ...PACKAGES.map((name) => ["deprecate", `${name}@${badVersion}`, message]),
  ...PACKAGES.map((name) => ["dist-tag", "add", `${name}@${goodVersion}`, "latest"]),
  ...PACKAGES.map((name) => ["view", name, "dist-tags"]),
];

const startedAt = process.hrtime.bigint();
for (const step of steps) {
  const rendered = `npm ${step.join(" ")}`;
  if (!execute) {
    console.log(`[dry-run] ${rendered}`);
    continue;
  }
  console.log(`[rollback] ${rendered}`);
  const result = spawnSync("npm", step, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`error[ROLLBACK-STEP]: \`${rendered}\` 실패 (exit ${result.status}). 이후 단계를 중단한다.`);
    process.exit(1);
  }
}
const elapsedSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;

console.log(`[rollback] ${execute ? "실행" : "dry-run"} 완료: ${steps.length}개 명령, ${elapsedSeconds.toFixed(1)}초 (NFR-004 예산 600초)`);
console.log("[rollback] 마지막 단계: 롤백 사유와 재승격 버전을 main에 커밋 또는 이슈로 기록하고, 근본 원인 해결 후 패치 버전으로 재배포한다.");
