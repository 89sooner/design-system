# Conductor Design System 구현 추적 원장

> 상태: review | 버전: v0.4 | 갱신일: 2026-07-11

## 1. 목적과 갱신 규칙

이 문서는 문서와 코드를 잇는 살아있는 원장이다. **REL-001이 완료되었다.** WP-001 ~ WP-007이 `done`이며, `@conductor/tokens`가 토큰 소스·빌드 파이프라인·`buildTokens`·`checkContrast`·`lint:tokens`를 모두 제공한다. WP를 완료할 때마다 코딩 에이전트가 이 문서를 갱신한다.

**REL-001 종료 기준 충족 근거** (2026-07-10, 클린 체크아웃에서 실행):

| 게이트 | 결과 |
| --- | --- |
| `pnpm lint` / `lint:deps` / `build` / `typecheck` / `test` / `lint:tokens` / `check:contrast` | 7개 전부 exit 0 |
| 테스트 | 278 passed / 17 files |
| 빌드 시간 | 6.5초 (NFR-001 예산 180초) |
| 토큰 산출 | 276 정의 → 테마 블록당 CSS 202 선언(다크·명시 라이트·OS 라이트 폴백), `tokens.{js,d.ts,json}`, `breakpoints.{js,d.ts}` |
| 대비 검사 | 다크·라이트 각 40/40, 합계 80/80 통과, 미달 0건, 제외 165 토큰 (M-3, FR-A11Y-004 AC-1 충족) |
| 산출 `.d.ts`의 `any` | 0건 (M-6) |

WP-010이 라이트 팔레트와 테마 결정 CSS를 추가해 두 테마를 전제하는 AC를 검증했다. 문서 사이트의 테마 토글 및 SSR 인라인 스니펫 소비는 WP-018 범위다.

- 커밋과 PR 본문에 `Refs: WP-### FR-<AREA>-###` 줄을 남긴다. 관련 FR이 여러 개면 공백으로 나열한다.
- WP를 완료하면 §2 WP 상태 표의 상태를 `todo`에서 `in_progress`를 거쳐 `done`으로 갱신하고, 커밋/PR·검증 결과·갱신일 열을 채운다.
- WP가 구현한 FR은 §3 매핑 표에서 상태를 `not_started`에서 `implemented` 또는 `verified`로 갱신하고 구현 모듈·테스트 파일 열을 채운다.
- 문서와 코드가 어긋나면 조용히 코드만 바꾸지 않는다. §4의 절차에 따라 DEV를 등록하고 `../00_governance/change_control.md`의 CR로 연결한다.
- 이 문서는 기록 문서이며 범위를 결정하지 않는다. 범위 변경은 `change_control.md`에서만 시작한다.

## 2. WP 상태 표

WP-001 ~ WP-028의 이름·REL·선행 관계는 `conductor_work_packages.md`에서 정의한다. 이 표는 각 WP의 진행 상태만 추적하며 WP 정의를 다시 만들지 않는다. 이름과 REL 열은 `conductor_work_packages.md`의 정의를 옮겨 적은 것이며, 그쪽이 바뀌면 여기도 함께 갱신한다.

| WP ID | 이름 | REL | 상태 | 커밋/PR | 검증 결과 | 갱신일 |
| --- | --- | --- | --- | --- | --- | --- |
| WP-001 | 모노레포 부트스트랩 | REL-001 | done | (미커밋, 작업 트리) | `pnpm build` 6.7초(예산 180초), `pnpm typecheck` 통과, `pnpm test` 17/17 통과, `pnpm lint` 통과, `pnpm lint:deps` 4패키지·6에지·위반 0건. FR-DX-001 AC-1 음성 테스트: `tokens → react` 주입 시 `DEP_DIRECTION` + `DEP_CYCLE` 오류와 exit 1, 되돌린 뒤 exit 0 | 2026-07-10 |
| WP-002 | 토큰 스키마와 다크 팔레트 소스 | REL-001 | done | (미커밋, 작업 트리) | 276 토큰 정의(primitive 74 / semantic 87 / component 115). 소스 `tokens.css`의 `:root` 프로퍼티가 별칭 2개 제외 전부 1:1 존재. 상태 7·심각도 4 아이콘 메타데이터 11건. 계층 검사기 음성 테스트: semantic → component 주입 시 `error[TOK-TIER]` + 위반 키 쌍 + exit 1. 동일 계층 별칭 4개 통과(CR-008) | 2026-07-10 |
| WP-003 | 토큰 참조 해석기와 CSS 산출 | REL-001 | done | (미커밋, 작업 트리) | `dist/tokens.css` 202 선언, 전부 `--cdt-` 접두사, primitive 유출 0, 잔존 `var()` 체인 0. 별칭 해석 확인: `--cdt-surface-2` == `--cdt-surface-subtle`, `--cdt-border` == `--cdt-border-default`, `--cdt-status-running` == `--cdt-accent`. 음성 테스트(실제 주입): 순환 → `error[TOK-CYCLE]` + `surface.base → surface.canvas → surface.base` + exit 1; 미존재 키 → `error[TOK-UNKNOWN-REF]` + `from:`/`to:` + exit 1. 두 경우 모두 `no output written`, 이전 `tokens.css` 바이트 동일 보존(원자적 쓰기). 복원 후 재빌드 결과 원본과 바이트 동일 | 2026-07-10 |
| WP-004 | TypeScript·JSON 산출과 타입 | REL-001 | done | (미커밋, 작업 트리) | `dist/tokens.js`, `tokens.d.ts`(287줄), `tokens.json`(202 토큰), `breakpoints.{js,d.ts}` 산출. 산출 `.d.ts` 3종의 `any` 0건. `tokens.json`이 key·tier·usage·description 메타데이터 보유. `usage` 분류 검증: `status.neutralEnd`=decorative(CR-006), `status.queued`=nonText, `focusRing`=nonText, `border.control`=nonText | 2026-07-10 |
| WP-005 | 타이포·z-index·브레이크포인트 스케일 | REL-001 | done | (미커밋, 작업 트리) | `font.size` 7단계(10/11/12/13/14/16/20px)와 대응 `font.lineHeight`, `z` 6단계(0/10/20/30/40/50, 중복 0), `breakpoint` 3단계(560/800/1080px). `breakpoints` 객체 별도 export(`./breakpoints` 진입점). `@media` 조건 내 `var(--cdt-breakpoint-*)` 0건. 치환기가 `var()` 형태와 `{breakpoint.sm}` 별칭 형태를 모두 처리 | 2026-07-10 |
| WP-006 | 토큰 린트와 계약 테스트 | REL-001 | done | (미커밋, 작업 트리) | `pnpm lint:tokens` 동작. 픽스처 음성 테스트 4종 실증: 색 리터럴(`#ff0000`, `rgba()`) → `error[TOK-LITERAL]` + 파일:줄:열 + exit 1; px/ms/z-index/font-size 리터럴 4종 검출; **FR-THM-005 AC-3** — `--cdt-text-faint`가 `--cdt-surface-elevated` 배경 위에 칠해지면 `text-faint-on-elevated` 위반(2.94:1 명시) + exit 1; `/* cdt-allow-literal: <사유> */` 주석이 통과시키고 `--report`가 사유와 함께 출력. 테마 계약 테스트는 대칭 차집합 검사를 두 테마 픽스처로 증명하고 `themeSpecific` 예외를 리포트에 노출 | 2026-07-10 |
| WP-007 | 대비 검사기와 검사 쌍 정의 | REL-001 | done | (미커밋, 작업 트리) | `contrast-pairs.ts`에 40쌍 선언(CP-001 ~ CP-041, **CP-025 결번 보존** — CR-006). `pnpm check:contrast` 40/40 통과, 미달 0건, 제외 165 토큰(사유 포함). WCAG 2.1 상대 휘도 + alpha 합성. **오케스트레이터의 독립 WCAG 구현으로 40쌍 전부 교차 검증 — 불일치 0건(허용 오차 0.02).** 음성 테스트(실제 주입): `text.muted`를 `#3a4555`로 바꾸자 CP-006(2.03)·CP-007(1.59)·CP-040(1.69) 3쌍 실패, `check:contrast` exit 1, **빌드도 exit 1**, 쌍 ID·테마·측정값·기준값 출력. 복원 후 `contrast-report.json` 바이트 동일 | 2026-07-10 |
| WP-008 | `@conductor/css` 레이어 골격과 리셋 | REL-002 | done | (미커밋, 작업 트리) | 클린 체크아웃에서 게이트 7개 전부 exit 0(빌드 14초), 테스트 319 passed / 19 files. `dist/index.css` 9,163바이트 → **gzip 2,575바이트**(NFR-001 예산 20,480). `dist/component.css` gzip 2,392바이트. 두 산출물 모두 `!important` 0건, 레이어 밖 규칙 0건, `@import` 잔존 0건, 비-`--cdt-` 커스텀 프로퍼티 0건. **음성 테스트(실제 주입)**: `!important` → `error[CSS-IMPORTANT]` + exit 1; 레이어 밖 규칙 → `error[CSS-UNLAYERED]` + exit 1; 원격 `@import` → `error[CSS-REMOTE-FONT]` + exit 1(리졸버 단계); `@font-face src: url(https://)` 및 프로토콜 상대 `//` → `error[CSS-REMOTE-FONT]` + exit 1(AST 단계); 비-`--cdt-` 커스텀 프로퍼티 → `error[CSS-CUSTOM-PROPERTY]` + exit 1. 5회 실패 전부에서 `dist/` 바이트 동일 보존(원자적 쓰기). `lint:tokens` 스캔 대상이 6 → 14 파일로 늘어 처음으로 실질 동작; 허용 주석 제거 시 `px-literal` 2건, 색 리터럴 주입 시 `color-literal` 1건으로 exit 1 실증 | 2026-07-11 |
| WP-009 | 레이아웃 프리미티브 클래스 | REL-002 | done | (미커밋, 작업 트리) | 5개 클래스가 `cdt.layout`에 존재하고 색상 선언 0건. `cdt-split-layout`은 md 토큰(800px), `cdt-card-grid`는 sm 토큰(560px)에서 단일 컬럼. 카드 최소 열은 `--cdt-card-grid-min-column`(320px) 사용. CSS 빌드가 공개 `@conductor/tokens/breakpoints` 값으로 미디어 참조를 치환하며 산출물의 breakpoint CSS 변수 0건. CSS 57/57, 전체 330/330 테스트 통과. lint/lint:deps/build/typecheck/test/lint:tokens/check:contrast 전부 exit 0. gzip index 2,772B, component 2,589B. CR-012로 검증 명령의 stale dist 결함 수정 | 2026-07-11 |
| WP-010 | 라이트 팔레트와 테마 결정 계약 | REL-002 | done | (미커밋, 작업 트리) | `palette.light.ts`가 명세 6절의 파생값을 다크 메타데이터와 같은 키 집합으로 선언하고, component 재정의 8건(글래스 대안·정책 비활성 텍스트 등)을 적용. `tokens.css`는 명시 `data-cdt-theme` 속성을 우선하고 속성 부재 시 OS light만 라이트로 폴백하며 무효값은 다크로 귀결. `pnpm check:contrast` 다크·라이트 80/80, `pnpm test` 332/332, typecheck·lint:tokens 통과 | 2026-07-11 |
| WP-011 | `@conductor/react` 골격과 공통 계약 | REL-002 | done | (미커밋, 작업 트리) | React 18/19·react-dom·lucide peer 계약과 `sideEffects: false` 선언. `cx`, `PolymorphicProps`, 공유 ref/className/data/aria/native-props 계약 스위트, public component registry·빌드 전 누락 테스트 검사, SSR `renderToString` 하네스 추가. React 패키지 18/18 테스트, build·typecheck 통과 | 2026-07-11 |
| WP-012 | 액션·표면 컴포넌트군 | REL-002 | done | (미커밋, 작업 트리) | Button·IconButton·Card·CardGrid·Panel과 `cdt.component` CSS 구현. variant/loading/disabled/blocked, IconButton 필수 aria-label, Card 요소 자동 선택·중첩 대화형 경고, 공유 계약·SSR registry까지 검증. React 48/48, CSS 60/60, lint:tokens 통과 | 2026-07-11 |
| WP-013 | 상태 표시 컴포넌트군 | REL-002 | todo | - | - | - |
| WP-014 | 데이터 표시 컴포넌트군 | REL-002 | todo | - | - | - |
| WP-015 | 오버레이 컴포넌트군 | REL-002 | todo | - | - | - |
| WP-016 | 폼 컴포넌트군 | REL-002 | todo | - | - | - |
| WP-017 | 피드백 컴포넌트군 | REL-002 | todo | - | - | - |
| WP-018 | 문서 사이트 셸과 테마 토글 | REL-003 | todo | - | - | - |
| WP-019 | Getting Started와 Foundations 화면 | REL-003 | todo | - | - | - |
| WP-020 | 컴포넌트 카탈로그와 라이브 프리뷰 | REL-003 | todo | - | - | - |
| WP-021 | 토큰 참조 화면 | REL-003 | todo | - | - | - |
| WP-022 | Patterns·Accessibility 화면과 코드 복사 | REL-003 | todo | - | - | - |
| WP-023 | 셸 컴포넌트군 | REL-003 | todo | - | - | - |
| WP-024 | 접근성 검사 CI 잡 | REL-003 | todo | - | - | - |
| WP-025 | 번들 크기 검사 CI 잡 | REL-003 | todo | - | - | - |
| WP-026 | 시각 회귀 검사 | REL-004 | todo | - | - | - |
| WP-027 | Changesets와 npm 배포 워크플로 | REL-004 | todo | - | - | - |
| WP-028 | 문서 사이트 정적 배포 | REL-004 | todo | - | - | - |

상태값: `todo` / `in_progress` / `done` / `blocked`

## 3. 요구사항 → 코드/테스트 매핑 표

`srs_final.md` §9에 승인된 FR 49개 전부를 나열한다. 구현 모듈·테스트 파일·WP 열은 코드가 작성될 때 채운다.

| FR ID | 구현 모듈 | 테스트 파일 | WP | 상태 |
| --- | --- | --- | --- | --- |
| FR-TOK-001 | `packages/tokens/src/lint-cli.ts`, 토큰 소스 5종 | `packages/tokens/src/*.test.ts`, 픽스처 음성 테스트 | WP-002, WP-006 | 검증됨 (AC-1~AC-3 + 허용 주석 예외. 색·px·ms·z-index·font-size 리터럴을 파일:줄:열과 함께 exit 1로 차단) |
| FR-TOK-002 | `src/schema.ts`, `src/build/tiers.ts` | `src/build/tiers.test.ts` | WP-002 | 검증됨 (AC-1~AC-6. CR-008 반영. 역방향 주입 시 exit 1 + 위반 키 쌍 실증) |
| FR-TOK-003 | `src/build/reference.ts`, `src/build/write.ts` | `src/build/reference.test.ts`, `src/build/build.test.ts` | WP-003 | 검증됨 (AC-1~AC-4 + 예외. 순환·미존재 키 주입 시 exit 1, 이전 산출물 보존 실증) |
| FR-TOK-004 | `src/build/names.ts`, `src/build/emit-css.ts` | `src/build/names.test.ts`, `src/build/emit-css.test.ts` | WP-003 | 검증됨 (AC-1~AC-4 + 이름 충돌 예외. 202 선언 전부 `--cdt-`, primitive 유출 0) |
| FR-TOK-005 | `src/palette.dark.ts`, `src/palette.light.ts` | `src/palette.dark.test.ts` | WP-002, WP-010 | 검증됨 (AC-1~AC-5. 두 테마가 동일 상태·심각도·미터 키와 icon 메타데이터를 유지) |
| FR-TOK-006 | `src/build/emit-ts.ts`, `src/build/emit-json.ts` | `src/build/emit-artifacts.test.ts` | WP-004 | 검증됨 (AC-1~AC-4. 산출 `.d.ts`의 `any` 0건) |
| FR-TOK-007 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-4) |
| FR-TOK-008 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-3) |
| FR-TOK-009 | `packages/tokens/src/scales.ts`, `src/build/media.ts`, `packages/css/build.mjs`, `packages/css/checks.mjs` | `packages/tokens/src/scales.test.ts`, `packages/css/test/bundle.test.ts`, `test/checks.test.ts` | WP-005, WP-009 | 검증됨 (AC-1~AC-3. CSS 소스의 `{breakpoint.sm}`·`{breakpoint.md}`가 공개 `@conductor/tokens/breakpoints` 값으로 560px·800px 리터럴 치환되고 산출 미디어 조건의 breakpoint CSS 변수 0건. `CSS-MEDIA-VAR` 음성 테스트 포함) |
| FR-THM-001 | `src/palette.dark.ts`, `src/token-source.ts`, `src/build/emit-css.ts` | `src/palette.dark.test.ts`, `src/build/emit-css.test.ts` | WP-002, WP-010 | 검증됨 (AC-1~AC-4. 다크 소스 1:1·별칭·키 대칭 및 `color-scheme: dark`) |
| FR-THM-002 | `src/palette.light.ts`, `src/token-source.ts`, `src/build/emit-css.ts` | `src/theme-contract.test.ts`, `src/contrast/check.test.ts`, `src/build/emit-css.test.ts` | WP-010 | 검증됨 (AC-1~AC-4. 키 대칭, light color-scheme, 불투명 라이트 경계 3:1 이상, elevation alpha 차이) |
| FR-THM-003 | `src/token-source.ts`, `src/build/emit-css.ts` | `src/build/emit-css.test.ts` | WP-010 | 검증됨 (AC-1~AC-3. 명시 속성 우선, 속성 부재 OS 폴백, 무효값 다크) |
| FR-THM-004 | `src/contrast-pairs.ts`, `src/contrast-cli.ts` | `src/contrast-pairs.test.ts`, `src/contrast/check.test.ts` | WP-007, WP-010 | 검증됨 (AC-1~AC-4. 두 테마 80/80 통과, alpha 합성 포함) |
| FR-THM-005 | `src/palette.dark.ts`, `src/contrast-pairs.ts`, `src/lint-cli.ts` | `src/palette.dark.test.ts`, `src/contrast-pairs.test.ts` | WP-002, WP-006, WP-007 | 검증됨 (AC-1 focusRing 3.93/3.56, AC-2 border.control 3.23, AC-3 lint 차단 실증, AC-4~AC-6 usage 분류. CR-006 반영: `status.neutralEnd`=decorative, CP-025 결번) |
| FR-CSS-001 | `packages/css/src/layers.css`, `src/reset.css`, `src/base.css`, `src/utility.css`, `packages/css/checks.mjs`, `build.mjs` | `packages/css/test/bundle.test.ts`, `test/checks.test.ts` | WP-008 | 검증됨 (AC-1~AC-4 + Radix 예외. 산출물 첫 줄이 5레이어 선언, `!important` 0건, 레이어 밖 규칙 0건. 음성 테스트로 `CSS-IMPORTANT`·`CSS-UNLAYERED`·`CSS-UNKNOWN-LAYER` 각각 exit 1 실증. **AC-3은 구조로 증명**: Conductor 규칙이 전부 레이어 안에 있으므로 레이어 밖 소비자 규칙이 명시도와 무관하게 이긴다. 실브라우저 캐스케이드 측정은 §5 참조) |
| FR-CSS-002 | `packages/css/src/reset.css`, `src/utility.css` | `packages/css/test/bundle.test.ts` | WP-008 | 검증됨 (AC-1~AC-5 + 예외 처리. `box-sizing: border-box`가 `*`·`::before`·`::after`에, `font: inherit`가 `button`·`input`·`textarea`·`select`에, `:focus-visible`이 `var(--cdt-focus-ring)` 그림자와 `outline: none`에 적용. 원격 폰트 참조 0건을 두 단계(리졸버·AST)에서 차단. `cdt-sr-only`·`cdt-skip-link`가 `cdt.utility`에 존재. 예외 처리인 `./component.css`(리셋 제외 산출물)를 실제로 산출) |
| FR-CSS-003 | `packages/css/src/layout.css`, `packages/css/build.mjs` | `packages/css/test/bundle.test.ts` | WP-009 | 검증됨 (AC-1~AC-4. 5개 클래스가 `cdt.layout`에 존재, split 800px·card-grid 560px 반응형 단일 컬럼, 최소 열 토큰 값 320px의 `auto-fill`, 색상 속성 0건) |
| FR-CSS-004 | `packages/css/src/components.css`, `packages/react/src/action.tsx`, `src/surface.tsx` | `packages/css/test/bundle.test.ts`, `packages/react/src/testing/action.test.tsx`, `surface.test.tsx` | WP-012 | 구현됨 (AC-1~AC-4. Button/Card 대응 클래스·토큰 소비·구조 셀렉터 금지. 실브라우저 계산 스타일 대조는 WP-024) |
| FR-CSS-005 | `packages/css/src/base.css` | `packages/css/test/bundle.test.ts` | WP-008 | 부분 (AC-3·AC-4 충족: `scroll-behavior: auto`, 규칙이 `cdt.base`에 있고 전역 `*` 대신 `:root`/`[data-cdt-theme]` 스코프 셀렉터 사용, `!important` 0건. AC-1은 **AST로만 검증** — `--cdt-motion-*` 3종이 `0s`로 재정의되고 `transition-duration`·`animation-duration`이 `0s`로 선언됨을 단언한다. 계산값(computed) 측정은 실브라우저가 필요해 WP-024의 브라우저 하네스로 이월(§5). AC-2와 예외 처리(Spinner/ProgressRing 정적 텍스트)는 컴포넌트가 생기는 WP-012 이후) |
| FR-CMP-001 | `packages/react/src/cx.ts`, `src/types.ts`, `src/testing/contract.tsx`, `src/testing/public-components.ts` | `src/testing/contract.test.tsx`, `src/testing/public-components.test.ts`, `action.test.tsx`, `surface.test.tsx` | WP-011, WP-012 | 구현됨 (공통 스위트가 Button·IconButton·Card·CardGrid·Panel에 실행되며 registry가 테스트 파일·SSR을 강제) |
| FR-CMP-002 | `packages/react/src/action.tsx`, `packages/css/src/components.css` | `packages/react/src/testing/action.test.tsx`, `packages/css/test/bundle.test.ts` | WP-012 | 검증됨 (AC-1~AC-5 및 loading+disabled 예외. Button 3 variant, loading click 차단, IconButton aria-label 타입, native disabled/blocked) |
| FR-CMP-003 | `packages/react/src/surface.tsx`, `packages/css/src/components.css`, `src/data.tsx` | `packages/react/src/testing/surface.test.tsx`, `data.test.tsx`, `packages/css/test/bundle.test.ts` | WP-012, WP-014 | 검증됨 (AC-1~AC-4. Card의 대화형 요소 전환·상승·중첩 경고와 Table 자체 스크롤 컨테이너를 검증.) |
| FR-CMP-004 | `packages/react/src/status.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/status.test.tsx`, `packages/css/test/bundle.test.ts` | WP-013 | 검증됨 (AC-1~AC-5. Badge·StatusBadge·SeverityTag가 색·아이콘·텍스트 세 채널을 렌더하고, 7개 상태/4개 심각도 타입 및 `aria-hidden` 아이콘을 테스트한다. queued·neutralEnd는 토큰 명세에 따라 점+텍스트 마커 형태를 쓴다.) |
| FR-CMP-005 | `packages/react/src/data.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/data.test.tsx`, `packages/css/test/bundle.test.ts` | WP-014 | 검증됨 (AC-1~AC-5. Table 스크롤/숫자 셀/이름 경고, Timeline의 네이티브 button·div 전환, CodeBlock region·모노스페이스 스크롤, Kbd를 검증.) |
| FR-CMP-006 | - | - | - | 미착수 |
| FR-CMP-007 | - | - | - | 미착수 |
| FR-CMP-008 | - | - | - | 미착수 |
| FR-CMP-009 | - | - | - | 미착수 |
| FR-DOC-001 | - | - | - | 미착수 |
| FR-DOC-002 | - | - | - | 미착수 |
| FR-DOC-003 | - | - | - | 미착수 |
| FR-DOC-004 | - | - | - | 미착수 |
| FR-DOC-005 | - | - | - | 미착수 |
| FR-DOC-006 | - | - | - | 미착수 |
| FR-DOC-007 | - | - | - | 미착수 |
| FR-A11Y-001 | `packages/css/src/reset.css`, `src/components.css` | `packages/css/test/bundle.test.ts`, `packages/react/src/testing/action.test.tsx` | WP-008, WP-012 | 부분 (AC-1 공유 `:focus-visible` focusRing 적용 및 액션/표면 대화형 요소 검증. 키보드/실브라우저 측정은 WP-024) |
| FR-A11Y-002 | `packages/react/src/data.tsx` | `packages/react/src/testing/data.test.tsx` | WP-014 | 부분 (AC-4의 Timeline 대화형 단계가 네이티브 button으로 키보드 도달·Enter/Space 활성화를 제공함을 검증. 전체 키보드 경로와 오버레이 Escape 동작은 WP-015 이후에 완성.) |
| FR-A11Y-003 | `packages/react/src/status.tsx`, `packages/css/src/components.css` | `packages/react/src/testing/status.test.tsx`, `packages/css/test/bundle.test.ts` | WP-013 | 부분 (AC-1 및 AC-4의 상태·심각도 세 채널과 텍스트 구분을 검증. 폼 오류(AC-2)와 Meter(AC-3)는 WP-016·WP-017에서 구현한다.) |
| FR-A11Y-004 | `src/contrast-cli.ts`, `.github/workflows/ci.yml` | `src/contrast-pairs.test.ts`, `src/contrast/check.test.ts` | WP-007, WP-010 | 검증됨 (AC-1~AC-4. 두 테마 80/80 미달 0건, decorative 제외·focusRing/border.control 3:1 검사) |
| FR-A11Y-005 | - | - | - | 미착수 |
| FR-DX-001 | `scripts/check-deps.mjs`, 루트 `package.json` `build` 스크립트, `.github/workflows/ci.yml` | `scripts/check-deps.mjs` 음성 테스트(수동), 각 패키지 스모크 테스트 | WP-001 | 부분 (AC-1·AC-2·AC-3 충족. 클린 체크아웃에서 `lint → lint:deps → build → typecheck → test` 전부 exit 0, 빌드 6.5초. **AC-4 충족(WP-008)**: `packages/css/src/tokens.css`가 `@import "@conductor/tokens/tokens.css" layer(cdt.base);`로 공개 진입점만 참조하며, 빌드 리졸버가 tokens 패키지의 `exports` 맵을 통해 해석한다. 소스 상대경로 참조 0건. CR-009로 CI 순서 정정) |
| FR-DX-002 | 각 패키지 `package.json`의 `exports`·`types`, `tsup` DTS 산출, `packages/react/src/types.ts` | `packages/*/src/index.test.ts`, `packages/react/src/index.test.ts`, `packages/tokens/src/build/emit-artifacts.test.ts` | WP-001, WP-004, WP-011 | 부분 (AC-1·AC-2·AC-4 충족: React 공개 `.d.ts`의 `any` 및 `testing/` 내부 경로 0건. AC-3 소비자 `tsc --noEmit`은 WP-018) |
| FR-DX-003 | `packages/tokens/package.json`, `packages/css/package.json`, `packages/react/package.json` | `packages/tokens/src/index.test.ts`, `packages/css/test/exports.test.ts`, `packages/react/src/index.test.ts` | WP-003, WP-008, WP-011 | 부분 (React `sideEffects: false`·공개 exports와 peer 선언 충족. Button 단독 gzip 4KB는 WP-025) |
| FR-DX-004 | `packages/react/src/testing/ssr.tsx`, `src/testing/public-components.ts` | `src/testing/ssr.test.tsx`, `src/testing/public-components.test.ts`, `src/index.test.ts` | WP-011 | 부분 (AC-1 SSR 하네스와 AC-2 browser-global 금지 검사 구현. 실제 공개 컴포넌트·hydration 검증은 WP-012 이후) |
| FR-DX-005 | - | - | - | 미착수 |
| FR-QA-001 | `src/theme-contract.ts`, `src/token-source.ts` | `src/theme-contract.test.ts` | WP-006, WP-010 | 검증됨 (AC-1~AC-3. 실제 dark/light semantic·component 키 대칭과 `themeSpecific` 예외를 검사) |
| FR-QA-002 | `packages/react/src/testing/public-components.ts`, `src/testing/contract.tsx` | `src/testing/public-components.test.ts`, `src/testing/contract.test.tsx` | WP-011 | 구현됨 (AC-1 누락 테스트 fixture·빌드 전 검사, AC-2 FR/AC 명명, AC-3 공유 스위트. 개별 컴포넌트 상호작용 검증은 WP-012~017) |
| FR-QA-003 | - | - | - | 미착수 |
| FR-QA-004 | - | - | - | 미착수 |

상태값: `미착수` / `부분` / `구현됨` / `검증됨`

## 4. 편차(Deviation) 로그

| DEV ID | 발견일 | 유형 | 내용 | 관련 ID | 처리 CR | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| DEV-005 | 2026-07-11 | 문서 오류 | WP-009 완료 검증 시 발견. 공식 검증 방법이 `pnpm --filter @conductor/css test`만 실행하지만 CSS 테스트는 `packages/css/dist/*.css`를 읽고 빌드를 수행하지 않는다. 따라서 `src/layout.css` 또는 breakpoint 치환 로직을 변경한 뒤 빌드하지 않으면 과거 산출물을 검사해 잘못 통과할 수 있다. 현재 소스와 검사 대상을 일치시키려면 검증 명령에 CSS 빌드가 선행되어야 한다 | WP-009, FR-CSS-003, FR-TOK-009 | CR-012 | closed |
| DEV-004 | 2026-07-11 | 기술 제약 | WP-008 검증 중 발견(WP-008 자체와는 무관하며 CR-009가 세운 CI 단계의 결함이다). `.github/workflows/ci.yml`의 마지막 단계는 토큰 재빌드 후 `git status --porcelain --untracked-files=all`이 비어 있기를 요구한다. 그러나 그보다 앞선 `pnpm install --frozen-lockfile`이 `package.json`의 `bin` 항목(`conductor-build-tokens`·`conductor-check-contrast`·`conductor-lint-tokens`)을 0644 → 0755로 chmod한다. 따라서 이 단계는 **깨끗한 체크아웃에서도 항상 실패**하며, 실패 사유는 토큰 빌드와 무관하다. 실측 재현: `chmod 644 packages/tokens/bin/*.mjs && git status --porcelain packages/tokens/bin/` → 비어 있음. 이어서 `pnpm install --frozen-lockfile` 실행 → 같은 명령이 ` M` 3줄 출력. CI가 아직 한 번도 실행된 적 없어(커밋 2개, 워크플로 실행 0회) 드러나지 않았다 | FR-TOK-001, FR-DX-001 AC-2, WP-001, CR-009 | CR-011 | closed |
| DEV-003 | 2026-07-11 | 문서 오류 | WP-008 착수 시 발견. WP-008의 검증 방법 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test && pnpm size` 중 두 단계가 실행 불가능하거나 무의미하다. (1) `pnpm size`는 저장소 어디에도 없다. 이 스크립트를 만드는 것은 **WP-025의 구현 범위**이고 WP-025의 선행 WP는 WP-017이므로, WP-008 시점에는 존재할 수 없다. 즉 WP-008은 자신의 검증 명령을 실행할 수 없으면서 그 명령이 수행하는 gzip 20KB 게이트를 DoD로 요구한다. (2) `packages/css`에 `test` 스크립트가 없어 `pnpm --filter @conductor/css test`가 아무것도 실행하지 않고 종료 코드 0을 반환한다(pnpm 10.4.1은 없는 lifecycle 스크립트를 조용히 no-op 처리). 실측: `pnpm --filter @conductor/css test` → exit 0, stdout·stderr 모두 비어 있음. 이는 **절대 실패할 수 없는 검사**이며, CR-009에서 이미 한 번 제거한 결함 유형이다(통과가 보장된 검사는 없는 것보다 나쁘다) | WP-008, WP-025, FR-DX-003 AC-3, NFR-001 | CR-010 | closed |
| DEV-002 | 2026-07-10 | 기술 제약 | WP-003/WP-004 구현 후 발견. `@conductor/tokens`의 공개 타입 표면 일부(`tokens.ts`, `breakpoints.ts`)는 토큰 빌드가 **생성**한다. 그러나 WP-001이 세운 CI 순서는 `install → typecheck → lint → lint:deps → build → test`로, 생성 전에 타입 검사를 돌린다. 생성 파일을 제거하고 `pnpm typecheck`를 실행해 재현했다: `src/index.ts(9,24): error TS2307: Cannot find module './tokens'` 외 3건, 종료 코드 2. 현재 CI가 통과하는 유일한 이유는 생성 파일이 `.gitignore`에 없어 소스 트리에 남기 때문이며, 이는 생성물이 토큰 소스와 어긋날 여지를 만든다(FR-TOK-001의 "토큰 소스가 유일한 입력" 원칙과 충돌) | FR-TOK-006, FR-DX-001 AC-2, FR-TOK-001, WP-001 | CR-009 | closed |
| DEV-001 | 2026-07-10 | 문서 오류 | WP-002 구현 착수 시 발견. FR-TOK-002 AC-2는 "semantic 토큰은 primitive 토큰만 참조한다"고 규정하지만, 토큰 설계에는 semantic → semantic 참조가 4건 존재한다: `surface.2` → `{surface.subtle}`, `border` → `{border.default}`(둘 다 FR-THM-001 AC-2가 **요구**하는 별칭), `status.running` → `{accent}`, `elevation.overlay` → `{border.strong}`. `conductor_design_system_tokens.md` §2.1이 AC-2를 재천명한 직후 §2.3이 이 참조들을 정의해 같은 문서 안에서도 모순된다. AC-2를 문자 그대로 구현하면 FR-THM-001 AC-2가 요구하는 별칭 2개를 만들 수 없다 | FR-TOK-002 AC-2·AC-3, FR-THM-001 AC-2, FR-TOK-003 | CR-008 | closed |

아래 절차로만 등록한다.

1. **DEV 등록**: 문서와 코드(또는 문서와 실제 소스 저장소 실측값)가 어긋나는 지점을 발견하면 위 표에 `DEV-###` 행을 추가한다. 발견일, 유형, 내용, 관련 FR/WP ID를 적는다. 코드를 먼저 바꾸지 않는다.
2. **CR 개설**: `../00_governance/change_control.md`의 변경 요청(CR) 대장에 CR을 등록하고 DEV ID를 연결한다.
3. **분류**: CR을 다음 세 유형 중 하나로 분류한다. `문서 오류`(요구사항 문서 자체의 실수), `범위 공백`(승인된 FR이 다루지 않는 상황이 발견됨), `기술 제약`(승인된 요구사항을 현재 기술 스택으로 만족할 수 없음).
4. **cascade 후 CR 종료**: `change_control.md` §2의 순서(`srs_final.md`부터 `docs/README.md`까지)로 영향받는 문서를 갱신하고, validator 실행 결과를 기록한 뒤 CR을 닫는다. 영향받은 WP는 §2 WP 상태 표에서 상태를 재설정한다.

## 5. 알려진 제약

| 제한 | 영향 | 관련 ID | 처리 방향 |
| --- | --- | --- | --- |
| 포커스 링과 폼 컨트롤 경계가 소스보다 뚜렷하다 (OD-001 종결, CR-005) | `focusRing`이 accent alpha 0.30 → 0.80으로, 폼 컨트롤 경계가 신규 `border.control`(slate alpha 0.60)로 바뀐다. G-1(시각 보존)의 의도된 예외이며, 소스 대비 시각 차이가 발생한다 | FR-THM-005, FR-A11Y-001, FR-A11Y-004 | 승인된 제약이다. 시각 회귀 기준 이미지를 이 값으로 생성한다. 소스 값으로 되돌리지 않는다 |
| 시각 회귀 검사가 v1 릴리스 게이트에 없다 (OD-002 종결, CR-005) | M-1(픽셀 차이 1% 이하)이 v1에서 자동 측정되지 않는다. REL-001~REL-003 기간에는 수동 시각 확인에 의존한다 | FR-QA-004(`deferred`), WP-026 | REL-004에서 WP-026을 실행해 측정을 시작한다 |
| `text.faint`를 `surface.elevated` 위에 쓸 수 없다 | 대비율 2.94로 비텍스트 3:1에도 미달한다. `pnpm lint:tokens`가 이 조합을 차단한다 | FR-THM-005 AC-3 | 해당 위치에는 `text.muted`(4.76)를 쓴다 |
| 다크 테마에서 종료 상태(`status.neutralEnd`) 점이 배경에서 흐리게 읽힌다 (CR-006, 해소안 A) | 값 `#475569`를 보존한 대가다. 대비율 2.04 ~ 2.60으로 `nonText` 3:1에 미달하나 `decorative`로 분류되어 검사 대상이 아니다. 상태 식별은 아이콘·텍스트 병기(FR-THM-005 AC-7)와 마커의 표면색 링이 담당한다 | FR-THM-005 AC-6, FR-A11Y-003 | 승인된 제약이다. 시인성 불만이 실제로 제기되면 CR을 열어 값 교정(`#5d6e86`, 3.26)을 검토한다 |
| 라이트 테마에서 다크 전용 시각 장치(글래스 배경, 글로우)의 재현 한계(R-1) | 다크 팔레트의 글래스/글로우 효과가 라이트 배경 위에서 판독 불가능할 수 있다 | FR-THM-002 | 판독 불가한 컴포넌트 토큰은 라이트 팔레트에서 solid 대안 값으로 재정의한다. 컴포넌트 코드는 수정하지 않는다 |
| 감소 모드의 `transition-duration`·`animation-duration` **계산값**이 실브라우저에서 측정된 적이 없다 | FR-CSS-005 AC-1을 `packages/css/test/bundle.test.ts`가 AST 단언으로만 검증한다(`--cdt-motion-*` 3종이 `0s`로 재정의되고 두 속성이 `0s`로 선언됨). node 환경의 `getComputedStyle`은 `@media`와 캐스케이드 레이어를 평가하지 않는다 | FR-CSS-005 AC-1, WP-008, WP-024 | WP-024가 Playwright chromium 브라우저 하네스(ADR-009)를 도입할 때 `prefers-reduced-motion` 에뮬레이션으로 계산값을 측정하고 이 항목을 닫는다 |
| FR-CSS-001 AC-3(레이어 밖 소비자 규칙이 이긴다)이 실브라우저 캐스케이드로 측정된 적이 없다 | "Conductor 규칙이 전부 레이어 안에 있다"는 구조적 사실로부터 CSS 명세상 도출한다. 산출물에 레이어 밖 규칙이 0건임은 `CSS-UNLAYERED` 검사가 강제하고, 규칙 주입 시 exit 1로 실증했다 | FR-CSS-001 AC-3, WP-008, WP-024 | WP-024의 브라우저 하네스에서 소비자 규칙 오버라이드를 1건 측정해 닫는다 |
| 리셋의 `::selection`과 링크 hover 색이 소스와 다르다 | 소스의 `rgba(109,124,255,0.32)`/`#fff`(선택 영역)와 `#aab3ff`(링크 hover)에 대응하는 토큰이 없다. 선택 영역은 `--cdt-accent-glow` + `--cdt-text-primary`로, 링크 hover는 색 변경 대신 `text-decoration: underline`으로 구현했다(어두운 배경에서 accent를 더 어둡게 하면 본문 대비 4.5:1이 깨진다) | FR-CSS-002, G-1, WP-008 | 승인된 제약이다. 정확한 색이 필요하면 토큰을 신설하는 CR을 열어 `packages/tokens`에서 처리한다(코드가 아니라 토큰 소스가 유일한 입력이다) |
| 스크롤바·`sr-only` 치수에 `cdt-allow-literal` 허용 주석 4건이 있다 | `10px`(스크롤바 트랙), `3px`(썸 테두리), `999px`(pill 반경), `1px`/`-1px`(시각적 숨김 상자)는 대응 토큰이 없다. `space` 스케일은 4px에서 시작하고 `radius` 최대값은 24px다 | FR-TOK-001 AC-3, WP-008 | 승인된 제약이다. `pnpm lint:tokens --report`가 4건을 사유와 함께 상시 노출한다 |
| 필터/칩 컴포넌트군(F-CMP-010)이 v1에 없다 | 소비자가 자체 구현한다. FR이 부여되지 않았고 WP도 없다 | OD-003 (open, 비차단) | REL-003 종료 시점에 Product가 결정한다 |

OD-002(시각 회귀 이월)와 OD-004(셸 컴포넌트군 패키지 포함)는 2026-07-10 CR-005로 종결되었다. 더 이상 조건부 제약이 아니다.

## 6. 코드 태깅 규약

- **커밋/PR `Refs:` 줄**: `Refs: WP-### FR-<AREA>-###` 형식을 커밋 메시지 또는 PR 본문에 남긴다. 한 WP가 여러 FR을 구현하면 공백으로 나열한다. 예: `Refs: WP-004 FR-TOK-004 FR-TOK-005`.
- **테스트 이름**: 각 테스트 이름 또는 인접 주석이 검증하는 FR과 AC를 `FR-<AREA>-### AC-#: <설명>` 형식으로 포함한다. 예: `FR-CMP-002 AC-2: loading 상태에서 클릭 핸들러가 호출되지 않는다`.
- **모듈 파일 상단 FR 범위 주석**: 각 모듈 파일 상단에 이 파일이 구현하는 FR 범위를 선언한다. TypeScript/TSX는 `// FR 범위: FR-CMP-002`, CSS는 `/* FR 범위: FR-CSS-004 */` 형식을 사용한다.

## 7. 요구사항 정합성 점검

`validate_srs_prd_env.py --root . --report --code-root <repo>` 를 실행하면, 승인된 FR 중 코드에 `Refs:` 태그 또는 FR 범위 주석으로 연결되지 않은 항목(미태깅 요구사항)을 점검할 수 있다. 코딩 에이전트는 WP 완료 시 이 스크립트를 실행하고, 리포트 결과를 §2 WP 상태 표의 검증 결과 열에 기록한다.
