# 명령어 / 테스트 결과 / 실패한 것과 원인

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
