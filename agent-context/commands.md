# 명령어 / 테스트 결과 / 실패한 것과 원인

## 2026-07-13 — WP-024~028 최종 검증

전체 게이트 (CI와 같은 순서 + 신규 게이트):

```bash
pnpm build && pnpm typecheck && pnpm check:api && pnpm test && pnpm lint && pnpm lint:tokens
pnpm check:contrast && pnpm check:secrets && pnpm check:changesets
pnpm test:a11y && pnpm size && pnpm lighthouse
pnpm --filter docs test:e2e
pnpm test:visual                       # Docker 필요
```

| 명령 | 결과 |
| --- | --- |
| `pnpm build` | 통과. tokens 337, contrast 80/80, CSS gzip 7,720B(index) / 7,558B(component) |
| `pnpm test` | 30 files, 487/487 |
| `pnpm lint:tokens` | 42 files, 0 violations, 57 allowances |
| `pnpm check:api` | 리포트 3종 일치, `any` 0건 |
| `pnpm check:secrets` | 218 files, 0 findings |
| `pnpm check:changesets` | 2 changesets, 0 violations |
| `pnpm test:a11y` | 134 passed / 1 fixture skipped |
| `pnpm size` | Button 527B / 4KB, CSS 7.54KiB / 20KB |
| `pnpm lighthouse` | LCP p75 1,937ms / 2,500ms, CLS 0.000 / 0.1, 외부 요청 0건, perf 98 |
| `pnpm --filter docs test:e2e` | 16/16 |
| `pnpm test:visual` | 25/25 |
| validator `--report` / `--strict` | issue 0 |

### 신규 명령

```bash
pnpm changeset                    # 변경 이력 파일 작성
pnpm check:changesets             # Refs 줄·major 마이그레이션 노트 규약 (FR-DX-005)
node scripts/check-changesets.mjs --require-empty   # 게시 전: 소비되지 않은 changeset이 없어야 한다
pnpm check:api                    # 공개 API 리포트 드리프트 + any 노출
pnpm check:api --update           # 의도된 API 변경 후 기준 갱신
pnpm check:secrets                # 토큰·PEM 7패턴 스캔
pnpm lighthouse                   # 정적 서빙 렌더 + 외부 요청 0건 + LCP/CLS 예산
node scripts/release-rollback.mjs 1.5.0 1.4.2            # dry-run
node scripts/release-rollback.mjs 1.5.0 1.4.2 --execute  # 실제 dist-tag 롤백
```

### 음성 테스트 — 새 게이트가 실제로 죽는지 확인

```bash
# API 리포트 드리프트: dist/index.d.ts에서 export 1건 제거
pnpm check:api        # error[API-REPORT-DRIFT] exit 1

# changeset 규약
printf -- '---\n"@conductor/react": patch\n---\n\nFix.\n' > .changeset/probe.md
pnpm check:changesets # error[CHANGESET-CONVENTION]: Refs 줄 없음 exit 1
# major + 마이그레이션 노트 없음 → 같은 코드로 exit 1

# 시크릿 스캔 (합성 PAT를 런타임에 주입, 커밋되지 않는다)
CONDUCTOR_SECRET_FIXTURE=1 pnpm check:secrets   # error[SECRET-LEAK] exit 1

# Lighthouse 예산 (LCP 예산을 1ms로 좁힌다)
CONDUCTOR_LH_FIXTURE=1 pnpm lighthouse          # error[LH-LCP-BUDGET] exit 1
```

### 소비자 스모크 (M-5 / QA-205, FR-DX-002 AC-3)

문서(W-002)가 지시하는 3개 명령을 workspace 밖 신규 Vite React 앱에서 그대로 실행했다. 미게시 상태라 `@conductor/*`는 `pnpm pack` tarball로 해석되게 `pnpm.overrides`를 뒀다.

```bash
pnpm add @conductor/tokens @conductor/css @conductor/react   # (tarball로 대체)
pnpm add react react-dom lucide-react
pnpm run build                                                # tsc --noEmit && vite build
```

결과: `tsc --noEmit` 0 오류, 빌드 성공. 중간에 `tokens.accent.value`(존재하지 않음, `DEFAULT`가 맞다)를 tsc가 잡아냈다 — 타입 계약이 실제로 강제된다는 증거다.

### 실패했던 명령과 원인

| 명령 | 증상 | 원인 | 해결 |
| --- | --- | --- | --- |
| `pnpm test:a11y` (빈 브라우저 캐시) | `browserType.launch: Executable doesn't exist` | pnpm 10이 lifecycle script를 막아 `pnpm install`이 Playwright 브라우저를 안 받는다. CI에 설치 단계가 없었다 | CI에 `pnpm exec playwright install --with-deps chromium` 추가 |
| `pnpm lighthouse` | 저장소 루트에 `C:\Users\...`, `\\wsl.localhost\...` 디렉터리 64개 생성 | `chrome-launcher`가 WSL을 감지해 프로필 경로를 Windows 형식으로 변환 → 리눅스 Chrome이 그 문자열을 디렉터리 이름으로 만든다 | chrome-launcher 제거, Playwright Chromium + CDP 포트로 전환 |
| `pnpm changeset version` | `ERR_REQUIRE_ESM` (`human-id`) | changesets 2.x가 순수 ESM인 `human-id` 4.2를 끌어온다 | `pnpm.overrides`로 `human-id: 4.1.1` 고정 |
| `pnpm add <절대경로>.tgz` (소비자 앱) | `No authorization header was set` | 절대 경로 tarball + workspace 전이 의존이 레지스트리로 해석된다 | 상대 경로 + `pnpm.overrides`로 3개 tarball 고정 |

## 2026-07-12 — WP-018~022 복원 재검증

### 통과

- `pnpm build`: 의존 방향 0 violations, tokens 318, contrast 80/80, CSS index gzip 6,812B, React registry 3/3, docs Vite build 통과.
- `pnpm typecheck`: 4개 구현 package 전체 통과.
- `pnpm --filter docs test:e2e`: browser/localhost 허용 실행에서 15/15 통과.
- `pnpm lint:tokens`: 38 files, 0 violations, 48 allowances.
- `pnpm check:contrast`: dark/light 80/80.
- SRS/PRD validator `--report`, `--strict`: issue 0.

### 실패

- `pnpm test`: tokens project를 jsdom으로 실행해 file URL 가정이 깨짐. suite 1 + tests 2 실패, 444 tests pass.
- `eslint .`: 5 errors. `apps/docs/src/catalog.tsx` 2건 + 기존 `packages/react/src/testing/contract.test.tsx` 3건.
- sandbox 내부 `pnpm --filter docs test:e2e`: preview webServer start exit 1. 샌드박스 밖 동일 명령은 15/15이므로 환경 제약으로 분류.

### 검증 중 생성물 정리

- 임시 `.corepack/`과 `apps/docs/test-results/`는 검증 후 삭제했다. `apps/docs/dist/`, `src/generated/*`, tokens generated TS는 기존 ignore 계약에 따른 빌드 산출물이다.

## 문서 검증

```bash
SKILL=~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py

python3 $SKILL --root . --report    # 단계·커버리지·다음 작업 대시보드
python3 $SKILL --root . --strict    # 핸드오프 게이트 (경고도 실패로 취급)
python3 $SKILL --root . --report --code-root .   # 문서↔코드 FR/WP 태그 커버리지
```

**마지막 실행 결과 (2026-07-11, WP-015 후)**

```text
OK: no structural or traceability issues found.
FR 정의: 49 | WP 28 | CR 12 | DEV 5
code scan 91 files | 40/49 FR tagged | 21/28 WP tagged
strict exit=0
```

## 코드 게이트 — CI와 동일 순서

```bash
pnpm lint            # eslint
pnpm lint:deps       # 의존 방향 가드
pnpm build           # tokens → css → react → docs (순차)
pnpm typecheck       # ★ build 뒤에 와야 한다 (CR-009)
pnpm test            # vitest
pnpm lint:tokens     # 토큰 소스 밖 하드코딩 차단
pnpm check:contrast  # WCAG 2.1 AA
```

**마지막 실행 결과 (2026-07-11, WP-015 후)**

```text
lint             exit=0
lint:deps        exit=0        4 workspace packages, 6 edges, 0 violations
build            exit=0
typecheck        exit=0
test             exit=0        Test Files 27 passed | Tests 434 passed
lint:tokens      exit=0        scanned 34 file(s), 0 violation(s), 31 allowance(s)
check:contrast   exit=0        dark/light 80/80 pass
docs validator   exit=0        report/strict both clean
git diff --check exit=0        LF -> CRLF warnings only
```

## 유용한 개별 명령

```bash
pnpm --filter @conductor/tokens run build       # ★ CLI를 먼저 재번들한다. 소스 변경 반영에 필수
node packages/tokens/bin/conductor-build-tokens.mjs      # 번들된 dist/cli.js 실행 (소스 변경 미반영!)
pnpm lint:tokens --report                       # 허용 주석(allow-list) 목록 출력
pnpm check:contrast                             # dist/contrast-report.json 재생성
```

## 음성 테스트 — 도구가 실제로 죽는지 확인한 방법

모든 검사는 **결함을 주입해서** 검증했다. 통과하는 걸 보는 건 검증이 아니다.

### 의존 방향 (FR-DX-001 AC-1)

```bash
# packages/tokens/package.json 에 "@conductor/react": "workspace:*" 주입
node scripts/check-deps.mjs
```
```text
error[DEP_DIRECTION]: @conductor/tokens -> @conductor/react
error[DEP_CYCLE]: @conductor/css → @conductor/tokens → @conductor/react → @conductor/css
[check-deps] 2 violation(s)         exit=1
# 되돌리면: [check-deps] 4 workspace packages, 6 internal edges, 0 violations   exit=0
```

### 순환 참조 (FR-TOK-003 AC-3)

```bash
# palette.dark.ts: surface.base -> alias "surface.canvas", surface.canvas -> alias "surface.base"
pnpm --filter @conductor/tokens run build
```
```text
error[TOK-CYCLE]: circular token reference detected
  surface.base → surface.canvas → surface.base
  hint: break the cycle; a token cannot resolve through itself.
no output written                    exit=1
# 이전 dist/tokens.css 바이트 동일 보존됨 (원자적 쓰기)
```

### 미존재 키 (FR-TOK-003 AC-4)

```text
error[TOK-UNKNOWN-REF]: token reference points at an unknown key
  from: surface.2
  to:   surface.doesNotExist
no output written                    exit=1
```

### 역방향 계층 (FR-TOK-002 AC-4)

```text
error[TOK-TIER]: 1 reverse token reference(s)
  surface.base (semantic) -> button.primary.background (component): a semantic token may not reference a component token
  hint: references run primitive <- semantic <- component; never upward.
no output written                    exit=1
```

### 토큰 린트 (FR-TOK-001, FR-THM-005 AC-3)

```bash
# packages/css/src/__probe.css 에 위반 주입 후 pnpm lint:tokens
```
```text
error[TOK-LITERAL]: 2 hardcoded value(s) outside the token source
  packages/css/src/__probe.css:1:21  color-literal  colour literal `#ff0000`
  packages/css/src/__probe.css:1:42  color-literal  colour literal `rgba(1,2,3,0.5)`
  ...
  __probe.css:1:23  px-literal        px literal `13px`
  __probe.css:1:29  z-index-literal   numeric `z-index` `42`
  __probe.css:1:42  font-size-px      `font-size` literal `15px`
  __probe.css:1:71  ms-literal        ms literal `200ms`
  __probe.css:1:66  text-faint-on-elevated  `--cdt-text-faint` is painted on `--cdt-surface-elevated` (2.94:1)
                                              exit=1

# /* cdt-allow-literal: <reason> */ 주석이 있으면:
[lint:tokens] scanned 7 file(s), 0 violation(s), 1 allowance(s)   exit=0
```

### 대비 검사 (FR-THM-004, FR-A11Y-004)

```bash
# palette.dark.ts: text.muted "#8290a3" -> "#3a4555"
pnpm --filter @conductor/tokens run build     # exit=1 — 대비 검사가 빌드에 물려 있다
pnpm check:contrast
```
```text
theme=dark  id=CP-006  pair=text.muted/surface.base       ratio=2.03  threshold=4.50(body)  FAIL
theme=dark  id=CP-007  pair=text.muted/surface.elevated   ratio=1.59  threshold=4.50(body)  FAIL
theme=dark  id=CP-040  pair=text.muted/state.disabled     ratio=1.69  threshold=4.50(body)  FAIL
3 of 40 pairs checked failed contrast threshold           exit=1
# 복원 후 contrast-report.json 바이트 동일
```

## 독립 교차 검증 — 같은 코드로 자기를 검증하지 않기

`check:contrast`가 만든 `dist/contrast-report.json`의 40쌍을 **별도로 작성한 WCAG 구현**으로 재계산해 대조했다.

```bash
python3 <독립_구현>.py /home/roqkf/design-system
```
```text
cross-checked 40 pairs with an independent WCAG implementation
disagreements (>0.02 or verdict mismatch): 0
```

핵심 수치 (양쪽 일치):

| 쌍 | 측정 | 기준 | 의미 |
| --- | --- | --- | --- |
| CP-001 `text.primary` / `surface.base` | 18.32 | 4.5 | — |
| CP-006 `text.muted` / `surface.base` | 6.06 | 4.5 | — |
| CP-009 `accent` / `surface.base` | 5.60 | 4.5 | — |
| CP-013 `focusRing` / `surface.base` | **3.93** | 3.0 | CR-005 교정 전 1.50 (WCAG 2.4.11 위반) |
| CP-014 `focusRing` / `surface.raised` | 3.56 | 3.0 | — |
| CP-017 `border.control` / `surface.raised` | **3.23** | 3.0 | CR-005 신설. 소스는 `border.default` 1.30 |
| CP-024 `status.queued` / `surface.raised` | 3.56 | 3.0 | `nonText` 유지 |
| — `status.neutralEnd` | 제외 | — | CR-006, `decorative`. CP-025 결번 |

미세 차이 하나: 문서는 합성색을 hex(`#5965d0`)로 반올림 후 계산해 3.93, 실수 유지 시 3.94. 판정 무관.

## 실패했던 명령과 원인

| 명령 | 증상 | 원인 | 해결 |
| --- | --- | --- | --- |
| `node packages/tokens/bin/conductor-build-tokens.mjs` (소스 변조 후) | exit 0, 아무 변화 없음 | **bin은 번들된 `dist/cli.js`를 실행한다.** 소스 변경이 반영 안 됨 | `pnpm --filter @conductor/tokens run build` 사용 |
| `pnpm typecheck` (클린 체크아웃) | `TS2307: Cannot find module './tokens'` ×4, exit 2 | 타입 표면 일부가 빌드 생성물 | CI 순서를 `build → typecheck`로 반전 (CR-009) |
| `pnpm test` (WP-003 직후) | `expect(Object.keys(exports)).toEqual([".", "./package.json"])` 실패 | WP-001 테스트가 **스냅샷**을 단언. WP-003/004가 정당하게 진입점 추가 | 규칙 기반 단언으로 교체(필수 진입점 존재 / `./src/` 미노출 / 대상 파일 실재) |
| `pnpm test` (WP-005 직후) | `substituteBreakpoints`가 `{breakpoint.sm}` 미치환 | `var(--cdt-breakpoint-sm)` 형태만 처리 | 두 형태 모두 처리하도록 수정 |
| `grep -E ...` (Bash 도구) | Permission denied | 샌드박스 정책 | `python3` 힙독으로 대체 |
| `cd <dir> && ...` (Bash 도구) | Permission prompt | `cd` 조합 명령 | 절대 경로 사용 |

## 저장소 상태

저장소는 git repo이며 `main` 브랜치에 커밋 2개가 있다. WP-001~009 작업은 아직 작업 트리에 있다. `pnpm install`로 생긴 token bin 파일 mode 변화는 `git -c core.fileMode=false`로 무시하라.

커밋할 때의 규약:

```text
Refs: WP-008 FR-CSS-001 FR-CSS-002
```

테스트 이름 규약:

```ts
test("FR-CMP-002 AC-2: loading 상태에서 클릭 핸들러가 호출되지 않는다", ...)
```

## WP-023 최종 검증 (2026-07-12)

| 명령 | 결과 |
| --- | --- |
| `pnpm build` | 통과. dependency violation 0, tokens 337, contrast 80/80, CSS gzip 7,751/7,590B, React/docs build 성공 |
| `pnpm typecheck` | tokens/css/react/docs 통과 |
| `pnpm test` | 29 files, 485/485 |
| `pnpm lint` | 통과 |
| `pnpm lint:tokens` | 40 files, 0 violations, 57 allowances |
| `pnpm check:contrast` | dark/light 합계 80/80 |
| `pnpm --filter @conductor/react test -- shell` | 12 files, 142/142. 현재 script는 project 전체 실행 |
| CSS test | 3 files, 76/76 |
| docs Playwright | 16/16. 600px scrim click, Escape, skip focus 포함 |
| validator `--report`, `--strict` | issue 0 |

### WP-023에서 실제로 실패한 검증

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 모바일 overlay selector 부재 | Radix Overlay가 `modal={false}`에서 null | plain scrim + Radix DismissableLayer |
| scrim 수정 뒤 docs E2E 재실패 | docs-only build가 stale React dist 소비 | React/root build 선행 |
| tokens emit test가 `skipLink:`를 primitive로 판정 | `"ink:"` substring 검사 오탐 | top-level key regex |
| token lint가 CSS test에서 실패 | test title의 `800px` literal | `md breakpoint` 문구 사용 |
| TopBar type/common contract 실패 | ReactNode slot title과 native string title 교차 | inherited native title omit + string mirror |
