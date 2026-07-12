# 리스크 / 불확실한 가정 / 검증에서 속을 뻔한 지점

## 2026-07-12 강제 compaction 복원에서 발견

### M. Vitest project environment는 다른 package의 URL 의미를 바꾼다

`vitest.config.ts`에서 tokens project를 node → jsdom으로 바꾸면 `import.meta.url` 기반 file reads가 `The URL must be of scheme file` 또는 `/src/tokens.ts` ENOENT로 깨진다. docs는 Playwright E2E를 사용하므로 docs 브라우저 검사를 위해 tokens project 환경을 바꿀 이유가 없다. package별 environment를 섞지 말고 필요한 project에만 jsdom을 적용한다.

### N. WP summary done과 DoD checkbox는 독립적으로 어긋날 수 있다

현재 WP-018~022 summary는 done이지만 각 DoD는 전부 unchecked다. traceability의 FR-DOC-001도 완료된 후속 WP를 미완료 사유로 든다. handoff에서 “done” 한 칸만 읽지 말고 WP body와 FR ledger를 함께 확인한다.

### O. Playwright webServer 실패를 제품 실패로 단정하지 않는다

제한된 sandbox에서는 localhost preview server/browser가 시작되지 않았다. 권한이 있는 실행에서 같은 tree와 command가 15/15 통과했다. 실패 시 먼저 webServer 권한/포트/브라우저 실행 환경을 분리 진단한다.

### P. docs bundle warning은 현재 실패가 아니지만 후속 gate의 입력이다

Vite JS chunk가 507.34 kB(minified), 144.59 kB gzip으로 500 kB 경고를 낸다. WP-025의 package size와 WP-028의 Lighthouse 범위를 침범해 즉시 임의 code-splitting하지 않는다. 후속 WP에서 실제 예산과 측정 대상을 기준으로 판단한다.

## 2026-07-11(WP-010~012) 세션에서 추가된 함정

## 2026-07-11(WP-013~014) 세션에서 추가된 함정

## 2026-07-11(WP-015) 세션에서 추가된 함정

### J. Radix Tooltip은 SSR registry에서도 Provider가 필요하다

`Tooltip.Root`를 단독 SSR render하면 ``Tooltip must be used within TooltipProvider`` 오류가 난다. public registry renderer는 `Tooltip.Provider`로 감싸야 한다.

### K. jsdom에는 ResizeObserver와 완전한 pointer flow가 없다

Radix Tooltip content는 ResizeObserver를 사용하고, DropdownMenu trigger는 pointer event를 기대한다. test-local ResizeObserver shim을 두고 menu role 검사는 `defaultOpen` fixture로 한다. 이 shim은 production code에 넣지 않는다.

### L. Radix portal content는 render container 바깥에 있다

Dialog/Tooltip/Menu content는 document body portal로 렌더된다. Testing Library test는 container query 대신 role query를 쓰고 Escape 뒤 effect는 `waitFor`로 기다린다.

### G. required children은 `createElement`의 세 번째 인자로 타입 충족되지 않을 수 있다

`publicComponents` SSR registry에서 required `children`을 가진 compound root는 `createElement(Component, { children: null })`처럼 props object에 넣어야 한다. 세 번째 `null` child는 runtime에는 전달돼도 TypeScript overload의 required prop 검증은 통과하지 못한다.

### H. focus-visible 0건 규칙에는 명시된 clipping 예외가 있다

Timeline은 overflow hidden parent에서 reset focus ring이 잘리지 않게 component layer에서 `:focus-visible` selector가 필요하다. 이 규칙은 ring을 덮어쓰면 안 되고 position/z-index만 가져야 한다. 정적 CSS 테스트도 그 불변식을 검사한다.

### I. token lint는 테스트 코드의 수치도 검사한다

CSS 테스트에 `800px`을 하드코딩해도 lint 대상이다. built `--cdt-breakpoint-md` 값을 읽어 regex를 만들고, CSS z-index는 `--cdt-z-*` 토큰으로 써야 한다.

### D. jsdom 프로젝트에서 테스트 현재 경로를 가정하지 말 것

React 단독 실행과 루트 `pnpm test`는 cwd가 다르다. 매니페스트/산출물을 읽는 테스트는 `packages/react` 존재 여부로 root를 계산해야 한다. `readFileSync("package.json")`는 루트 실행에서 잘못된 매니페스트를 읽는다.

### E. workspace alias가 `.tsx`를 따라가면 소비자 tsconfig도 JSX를 알아야 한다

docs typecheck가 `@conductor/react` source alias를 해석한다. React package에만 JSX 설정을 두면 docs는 TS6142로 실패한다. `tsconfig.base.json`의 `jsx: react-jsx`가 필요하다.

### F. 컴포넌트 CSS의 수치 리터럴은 토큰 린트 허용 사유가 필요하다

1px border, 34px compact button, hover translate는 현재 token에 대응값이 없다. `cdt-allow-literal`의 이유를 코드 옆에 남기고, 색상·간격은 token으로만 쓴다.

## 2026-07-11(WP-008) 세션에서 추가된 함정

## 2026-07-11(WP-009) 세션에서 추가된 함정

### A. CSS 테스트는 stale dist를 읽을 수 있다

`packages/css` 테스트는 빌드 산출물 CSS를 읽는다. `pnpm --filter @conductor/css test`만 실행하면 소스 변경이 dist에 반영되지 않아도 통과할 수 있다. WP-009에서 DEV-005/CR-012로 공식 검증 명령을 `build && test`로 정정했다.

### B. lightningcss가 미디어쿼리 문법을 정규화한다

`(max-width: 800px)`가 산출 또는 AST에서 `(width <= 800px)`처럼 표현될 수 있다. 테스트는 원문 문자열을 고정하지 말고 파싱 결과나 실제 breakpoint 값 존재 여부를 검사해야 한다.

### C. 미디어쿼리 안의 CSS 변수는 런타임에 평가되지 않는다

`@media (max-width: var(--cdt-breakpoint-md))`는 유효한 responsive 계약이 아니다. 소스는 `{breakpoint.md}` 같은 별칭을 쓰고, 빌드가 공개 `@conductor/tokens/breakpoints` 값을 리터럴로 치환한다. 산출물에 `var(--cdt-breakpoint-*)`가 남으면 `CSS-MEDIA-VAR`로 실패해야 한다.

### 0. 리뷰 서브에이전트가 작업 트리를 오염시킨다
적대적 리뷰 워크플로(vacuous-check 발견을 서브에이전트가 파일을 **변조**해 실증하는 패턴)에서, 검증 서브에이전트가 `packages/css/test/helpers.ts`의 `rulesInLayer`에 `if (found.length === 0) return found;`를 주입하고 **복원하지 않았다.** css 스위트 전체가 red가 됐고 하마터면 내 회귀로 오해할 뻔했다. 리뷰 워크플로가 쓰기 권한을 가졌으면 **끝난 뒤 반드시 `git status --porcelain`으로 트리를 확인**하고, 초록이던 스위트가 리뷰 직후 빨개지면 내 코드보다 남은 변조를 먼저 의심하라. 리뷰 서브에이전트에 `isolation: worktree` 또는 읽기 전용 에이전트 타입을 주는 편이 안전하다.

### 0b. `pnpm install`이 트리를 더럽힌다 (CR-011)
`pnpm install`이 `bin` 파일을 0755로 chmod한다. CI 재현성 단계의 `git status`가 이 때문에 클린 체크아웃에서도 실패했다. `git -c core.fileMode=false`로 고쳤다. 로컬에서 `git status`가 `packages/tokens/bin/*.mjs` 3건을 ` M`으로 보여줘도 모드 비트일 뿐 내용 변경이 아니다.

## 검증 함정 — 이전 세션에서 실제로 당할 뻔한 것들

### 1. `bin/`은 번들된 `dist/cli.js`를 실행한다

`packages/tokens/bin/conductor-build-tokens.mjs` → `dist/cli.js`. 토큰 소스를 고치고 **bin을 직접 실행하면 아무 변화가 없다.**

음성 테스트를 두 번 실패했다. 순환 참조를 주입했는데 빌드가 exit 0으로 통과했고, 하마터면 "원자적 쓰기 확인됨"이라고 잘못 기록할 뻔했다. `tokens.css`가 바이트 단위로 동일했던 것이 단서였다.

**올바른 방법**: `pnpm --filter @conductor/tokens run build` (이 스크립트가 `tsup --config tsup.cli.config.ts && node ./bin/... && tsup` 순서로 CLI를 먼저 재번들한다).

### 2. 절대 실패할 수 없는 검사

CR-009를 고치며 처음 넣은 CI 단계:

```yaml
git diff --exit-code -- packages/tokens/dist   # dist/ 는 gitignore 되어 있다
```

이 검사는 **어떤 경우에도 통과한다.** 통과가 보장된 검사는 없는 것보다 나쁘다 — 안전하다는 신호를 거짓으로 준다. 지웠다.

새 검사를 넣을 때 물어라: *"이게 실패하는 상황이 실제로 존재하는가?"*

### 3. `lint:tokens`가 자명하게 통과한다

현재 `packages/css`와 `packages/react`가 거의 비어 있다. `lint:tokens`는 "6 파일 스캔, 위반 0건"으로 통과하지만 **아무것도 검사하지 않은 것과 구별되지 않는다.**

픽스처를 주입해 실제로 잡는지 확인했다(색 리터럴, px/ms/z-index/font-size, `text.faint` on `surface.elevated`, 허용 주석). WP-008 이후 실제 CSS가 생기면 이 린트가 처음으로 의미 있게 작동한다.

### 4. 같은 코드로 자기를 검증하지 마라

`check:contrast`의 40쌍을 **별도로 작성한 독립 WCAG 구현**으로 재계산해 대조했다(불일치 0건, 허용 오차 0.02). 에이전트가 만든 검사기를 그 에이전트의 테스트로만 확인하면 검증이 아니다.

미세 차이 하나: 문서는 합성색을 hex(`#5965d0`)로 반올림한 뒤 계산해 3.93, 실수로 유지하면 3.94. 판정(≥3.0)에는 영향 없다.

## 제품 리스크 (PRD §10)

| ID | 리스크 | 영향 | 완화 |
| --- | --- | --- | --- |
| **R-1** | 라이트 테마가 다크 전용 시각 장치(글래스, 글로우, alpha 경계)를 재현하지 못한다 | 높음 | 라이트에서 경계를 **불투명 값**으로 재정의(§6.3). elevation은 그림자 alpha를 낮춘다. WP-010에서 조기 검증 |
| R-2 | 시각 회귀가 폰트 렌더 차이로 불안정 | 중간 | OD-002로 REL-004 이월. v1은 수동 시각 확인 |
| **R-3** | Radix 업그레이드가 DOM 구조를 바꿔 CSS가 깨진다 | 중간 | Radix 버전 정확 고정. `data-*` 속성 셀렉터만 사용. 구조 셀렉터 금지 |
| R-4 | 소스의 `!important`와 전역 `*` 셀렉터가 소비자 CSS와 충돌 | 높음 | `@layer`로 캐스케이드 낮춤. `!important` 0건 강제 |
| R-5 | 접두사 없는 토큰 이름이 소비자 변수와 충돌 | 중간 | `--cdt-` 강제. 빌드 검사가 접두사 없는 산출을 차단 |
| R-6 | 컴포넌트 범위가 도메인 컴포넌트로 번진다 | 높음 | F-X-009 명시 제외. WP DoD에 "도메인 결합 없음" |
| R-7 | 대비 검사가 소스 색을 실패시킨다 | 높음 | **실현됨.** CR-005/CR-006으로 처리 완료 |

## 승인된 알려진 제약 (원장 §5)

- **다크 테마 종료 상태(`status.neutralEnd`) 점이 흐리다** (2.04 ~ 2.60:1). `decorative`로 분류해 검사에서 뺀 대가다. 검사를 통과했다는 사실이 그 점이 잘 보인다는 뜻은 아니다. 시인성 불만이 실제로 제기되면 CR을 열어 `#5d6e86`(3.26:1) 교정을 검토한다
- **포커스 링과 폼 경계가 소스보다 뚜렷하다.** G-1(시각 보존)의 의도된 예외. 시각 회귀 기준 이미지를 이 값으로 생성해야 한다. 소스 값으로 되돌리지 마라
- `text.faint`를 `surface.elevated` 위에 쓸 수 없다(2.94:1). `lint:tokens`가 차단한다. 그 자리엔 `text.muted`(4.76:1)를 쓴다
- **시각 회귀(M-1)가 v1에서 자동 측정되지 않는다.** REL-001~003 기간엔 수동 시각 확인에 의존한다

## 불확실한 가정

- 라이트 팔레트 값은 `conductor_design_system_tokens.md` §5·§6에 산출돼 있으나 **아직 코드로 검증된 적이 없다.** WP-010이 `check:contrast`를 두 테마로 돌리는 첫 순간이다. 라이트 쪽 미달이 나올 수 있다
- `severity.*` 4색은 두 테마가 값을 공유하는 유일한 토큰군이다(절대 등급이므로). `themeSpecific` 예외를 쓰지 않으며 FR-QA-001 키 대칭 검사를 통과한다는 것이 문서의 주장이다. WP-010에서 확인하라
- `@conductor/css` gzip ≤ 20KB, `Button` 단독 gzip ≤ 4KB는 **아직 측정된 적 없다**(WP-025). 컴포넌트가 다 들어간 뒤에야 알 수 있다
- 문서 사이트 LCP p75 ≤ 2.5초도 미측정(WP-028)

## 문서 환경의 함정

`validate_srs_prd_env.py`는 백틱으로 감싼 `.md`로 끝나는 문자열을 **문서 경로로 오인**한다. 토큰 이름 `radius.md`, `font.size.md`, `breakpoint.md`, `font.lineHeight.md`를 백틱에 넣으면 경고가 뜬다. **볼드(`**radius.md**`)를 써라.** 실제 문서 파일명(`srs_final.md`)은 백틱으로 감싸도 된다.
