#!/usr/bin/env node
// Refs: WP-027 NFR-002 JOB-REL-001
// 보안 아키텍처 §5: npm 토큰, GitHub PAT, 클라우드 자격증명, 개인키(PEM) 패턴을
// 추적 파일 전체에서 스캔한다. 위반 1건이면 exit 1로 병합/배포를 차단한다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BINARY_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "ico", "woff", "woff2", "ttf", "otf", "webp", "zip"]);

const RULES = [
  { id: "npm-token", pattern: /\bnpm_[A-Za-z0-9]{36}\b/g },
  { id: "github-pat", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g },
  { id: "github-fine-grained-pat", pattern: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g },
  { id: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "gcp-api-key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { id: "private-key-block", pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g },
];

const trackedFiles = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .filter((path) => path.length > 0)
  .filter((path) => !BINARY_EXTENSIONS.has(path.split(".").pop().toLowerCase()));

const sources = trackedFiles.map((path) => ({ path, text: readFileSync(resolve(ROOT, path), "utf8") }));

// 음성 픽스처: 리포터와 규칙이 실제로 잡는지 실증한다. 토큰은 커밋되지 않도록
// 런타임에 합성한다.
if (process.env.CONDUCTOR_SECRET_FIXTURE === "1") {
  sources.push({ path: "__fixture__/leaked-config.ts", text: `const token = "${"ghp_"}${"A".repeat(36)}";\n` });
}

const findings = [];
for (const source of sources) {
  const lines = source.text.split("\n");
  for (const rule of RULES) {
    for (let index = 0; index < lines.length; index += 1) {
      if (rule.pattern.test(lines[index])) {
        findings.push({ path: source.path, line: index + 1, rule: rule.id });
      }
      rule.pattern.lastIndex = 0;
    }
  }
}

if (findings.length > 0) {
  console.error(`error[SECRET-LEAK]: ${findings.length} potential credential(s) found`);
  for (const finding of findings) console.error(`  ${finding.path}:${finding.line}  ${finding.rule}`);
  console.error("  유출된 시크릿은 이력 정리와 무관하게 발급 주체에서 즉시 폐기(revoke)한다.");
  process.exit(1);
}
console.log(`[check:secrets] scanned ${sources.length} file(s), 0 finding(s)`);
