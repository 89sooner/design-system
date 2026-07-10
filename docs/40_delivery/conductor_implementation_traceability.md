# Conductor Design System 구현 추적 원장

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-10

## 1. 목적과 갱신 규칙

이 문서는 문서와 코드를 잇는 살아있는 원장이다. **REL-001이 완료되었다.** WP-001 ~ WP-007이 `done`이며, `@conductor/tokens`가 토큰 소스·빌드 파이프라인·`buildTokens`·`checkContrast`·`lint:tokens`를 모두 제공한다. WP를 완료할 때마다 코딩 에이전트가 이 문서를 갱신한다.

**REL-001 종료 기준 충족 근거** (2026-07-10, 클린 체크아웃에서 실행):

| 게이트 | 결과 |
| --- | --- |
| `pnpm lint` / `lint:deps` / `build` / `typecheck` / `test` / `lint:tokens` / `check:contrast` | 7개 전부 exit 0 |
| 테스트 | 278 passed / 17 files |
| 빌드 시간 | 6.5초 (NFR-001 예산 180초) |
| 토큰 산출 | 276 정의 → CSS 202 선언, `tokens.{js,d.ts,json}`, `breakpoints.{js,d.ts}` |
| 대비 검사 | 다크 40/40 통과, 미달 0건, 제외 165 토큰 (M-3, FR-A11Y-004 AC-1 다크 한정 충족) |
| 산출 `.d.ts`의 `any` | 0건 (M-6) |

라이트 팔레트가 없으므로 두 테마를 전제하는 AC(FR-THM-001 AC-3, FR-TOK-005 AC-4, FR-A11Y-004 AC-1의 라이트 절반, FR-QA-001의 실제 대칭 검사)는 **WP-010에서 처음 검증된다.** 3절 매핑 표가 이를 `부분`으로 구분한다.

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
| WP-008 | `@conductor/css` 레이어 골격과 리셋 | REL-002 | todo | - | - | - |
| WP-009 | 레이아웃 프리미티브 클래스 | REL-002 | todo | - | - | - |
| WP-010 | 라이트 팔레트와 테마 결정 계약 | REL-002 | todo | - | - | - |
| WP-011 | `@conductor/react` 골격과 공통 계약 | REL-002 | todo | - | - | - |
| WP-012 | 액션·표면 컴포넌트군 | REL-002 | todo | - | - | - |
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
| FR-TOK-005 | `src/palette.dark.ts` | `src/palette.dark.test.ts` | WP-002 | 부분 (AC-1~AC-3, AC-5 충족. AC-4 두 테마 정의는 라이트 팔레트가 생기는 WP-010에서 완결) |
| FR-TOK-006 | `src/build/emit-ts.ts`, `src/build/emit-json.ts` | `src/build/emit-artifacts.test.ts` | WP-004 | 검증됨 (AC-1~AC-4. 산출 `.d.ts`의 `any` 0건) |
| FR-TOK-007 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-4) |
| FR-TOK-008 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-3) |
| FR-TOK-009 | `src/scales.ts`, `src/build/media.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-3) |
| FR-THM-001 | `src/palette.dark.ts` | `src/palette.dark.test.ts` | WP-002 | 부분 (AC-1·AC-2 충족: 소스 프로퍼티 1:1, 별칭 2개가 토큰 참조. AC-3 키 대칭과 AC-4 `color-scheme`은 WP-010) |
| FR-THM-002 | - | - | - | 미착수 |
| FR-THM-003 | - | - | - | 미착수 |
| FR-THM-004 | `src/contrast-pairs.ts`, `src/contrast-cli.ts` | `src/contrast-pairs.test.ts` | WP-007 | 부분 (AC-1~AC-4 충족, 다크 40/40 통과. 라이트 팔레트가 생기는 WP-010 이후 두 테마로 재검증) |
| FR-THM-005 | `src/palette.dark.ts`, `src/contrast-pairs.ts`, `src/lint-cli.ts` | `src/palette.dark.test.ts`, `src/contrast-pairs.test.ts` | WP-002, WP-006, WP-007 | 검증됨 (AC-1 focusRing 3.93/3.56, AC-2 border.control 3.23, AC-3 lint 차단 실증, AC-4~AC-6 usage 분류. CR-006 반영: `status.neutralEnd`=decorative, CP-025 결번) |
| FR-CSS-001 | - | - | - | 미착수 |
| FR-CSS-002 | - | - | - | 미착수 |
| FR-CSS-003 | - | - | - | 미착수 |
| FR-CSS-004 | - | - | - | 미착수 |
| FR-CSS-005 | - | - | - | 미착수 |
| FR-CMP-001 | - | - | - | 미착수 |
| FR-CMP-002 | - | - | - | 미착수 |
| FR-CMP-003 | - | - | - | 미착수 |
| FR-CMP-004 | - | - | - | 미착수 |
| FR-CMP-005 | - | - | - | 미착수 |
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
| FR-A11Y-001 | - | - | - | 미착수 |
| FR-A11Y-002 | - | - | - | 미착수 |
| FR-A11Y-003 | - | - | - | 미착수 |
| FR-A11Y-004 | `src/contrast-cli.ts`, `.github/workflows/ci.yml` | `src/contrast-pairs.test.ts` | WP-007 | 부분 (AC-2·AC-3·AC-4 충족. AC-1 "두 테마 미달 0건"은 다크만 측정 — 라이트는 WP-010) |
| FR-A11Y-005 | - | - | - | 미착수 |
| FR-DX-001 | `scripts/check-deps.mjs`, 루트 `package.json` `build` 스크립트, `.github/workflows/ci.yml` | `scripts/check-deps.mjs` 음성 테스트(수동), 각 패키지 스모크 테스트 | WP-001 | 부분 (AC-1·AC-2·AC-3 충족. 클린 체크아웃에서 `lint → lint:deps → build → typecheck → test` 전부 exit 0, 빌드 6.5초. AC-4 "선행 패키지의 산출물을 소비한다"는 `@conductor/css`가 `@conductor/tokens/tokens.css` 진입점을 실제로 import하는 WP-008에서 검증. CR-009로 CI 순서 정정) |
| FR-DX-002 | 각 패키지 `package.json`의 `exports`·`types`, `tsup` DTS 산출, `src/build/emit-ts.ts` | `packages/*/src/index.test.ts`, `packages/tokens/src/build/emit-artifacts.test.ts` | WP-001, WP-004 | 부분 (AC-1·AC-2 충족: 산출 `.d.ts` 3종의 `any` 0건. AC-3 소비자 `tsc --noEmit`와 AC-4 내부 타입 누출 검사는 실제 소비자가 생기는 WP-018 이후) |
| FR-DX-003 | `packages/tokens/package.json` | `src/index.test.ts` | WP-003 | 부분 (AC-1·AC-2·AC-4 충족: 5개 공개 진입점, `sideEffects: ["*.css"]`. AC-3 번들 크기는 WP-025) |
| FR-DX-004 | - | - | - | 미착수 |
| FR-DX-005 | - | - | - | 미착수 |
| FR-QA-001 | `src/theme-contract.ts` | `src/theme-contract.test.ts` | WP-006 | 부분 (AC-1~AC-3 로직과 `themeSpecific` 예외를 두 테마 픽스처로 증명. 실제 두 팔레트 대칭 검사는 WP-010에서 처음 수행) |
| FR-QA-002 | - | - | - | 미착수 |
| FR-QA-003 | - | - | - | 미착수 |
| FR-QA-004 | - | - | - | 미착수 |

상태값: `미착수` / `부분` / `구현됨` / `검증됨`

## 4. 편차(Deviation) 로그

| DEV ID | 발견일 | 유형 | 내용 | 관련 ID | 처리 CR | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
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
| 필터/칩 컴포넌트군(F-CMP-010)이 v1에 없다 | 소비자가 자체 구현한다. FR이 부여되지 않았고 WP도 없다 | OD-003 (open, 비차단) | REL-003 종료 시점에 Product가 결정한다 |

OD-002(시각 회귀 이월)와 OD-004(셸 컴포넌트군 패키지 포함)는 2026-07-10 CR-005로 종결되었다. 더 이상 조건부 제약이 아니다.

## 6. 코드 태깅 규약

- **커밋/PR `Refs:` 줄**: `Refs: WP-### FR-<AREA>-###` 형식을 커밋 메시지 또는 PR 본문에 남긴다. 한 WP가 여러 FR을 구현하면 공백으로 나열한다. 예: `Refs: WP-004 FR-TOK-004 FR-TOK-005`.
- **테스트 이름**: 각 테스트 이름 또는 인접 주석이 검증하는 FR과 AC를 `FR-<AREA>-### AC-#: <설명>` 형식으로 포함한다. 예: `FR-CMP-002 AC-2: loading 상태에서 클릭 핸들러가 호출되지 않는다`.
- **모듈 파일 상단 FR 범위 주석**: 각 모듈 파일 상단에 이 파일이 구현하는 FR 범위를 선언한다. TypeScript/TSX는 `// FR 범위: FR-CMP-002`, CSS는 `/* FR 범위: FR-CSS-004 */` 형식을 사용한다.

## 7. 요구사항 정합성 점검

`validate_srs_prd_env.py --root . --report --code-root <repo>` 를 실행하면, 승인된 FR 중 코드에 `Refs:` 태그 또는 FR 범위 주석으로 연결되지 않은 항목(미태깅 요구사항)을 점검할 수 있다. 코딩 에이전트는 WP 완료 시 이 스크립트를 실행하고, 리포트 결과를 §2 WP 상태 표의 검증 결과 열에 기록한다.
