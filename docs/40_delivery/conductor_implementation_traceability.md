# Conductor Design System 구현 추적 원장

> 상태: review | 버전: v0.26 | 갱신일: 2026-09-03

## 1. 목적과 갱신 규칙

이 문서는 문서와 코드를 잇는 살아있는 원장이다. **REL-001이 완료되었다.** WP-001 ~ WP-007이 `done`이며, `@conductor-by-89soone/tokens`가 토큰 소스·빌드 파이프라인·`buildTokens`·`checkContrast`·`lint:tokens`를 모두 제공한다. WP를 완료할 때마다 코딩 에이전트가 이 문서를 갱신한다.

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
| WP-001 | 모노레포 부트스트랩 | REL-001 | done | `8c85504` | `pnpm build` 6.7초(예산 180초), `pnpm typecheck` 통과, `pnpm test` 17/17 통과, `pnpm lint` 통과, `pnpm lint:deps` 4패키지·6에지·위반 0건. FR-DX-001 AC-1 음성 테스트: `tokens → react` 주입 시 `DEP_DIRECTION` + `DEP_CYCLE` 오류와 exit 1, 되돌린 뒤 exit 0 | 2026-07-10 |
| WP-002 | 토큰 스키마와 다크 팔레트 소스 | REL-001 | done | `8c85504` | 276 토큰 정의(primitive 74 / semantic 87 / component 115). 소스 `tokens.css`의 `:root` 프로퍼티가 별칭 2개 제외 전부 1:1 존재. 상태 7·심각도 4 아이콘 메타데이터 11건. 계층 검사기 음성 테스트: semantic → component 주입 시 `error[TOK-TIER]` + 위반 키 쌍 + exit 1. 동일 계층 별칭 4개 통과(CR-008) | 2026-07-10 |
| WP-003 | 토큰 참조 해석기와 CSS 산출 | REL-001 | done | `8c85504` | `dist/tokens.css` 202 선언, 전부 `--cdt-` 접두사, primitive 유출 0, 잔존 `var()` 체인 0. 별칭 해석 확인: `--cdt-surface-2` == `--cdt-surface-subtle`, `--cdt-border` == `--cdt-border-default`, `--cdt-status-running` == `--cdt-accent`. 음성 테스트(실제 주입): 순환 → `error[TOK-CYCLE]` + `surface.base → surface.canvas → surface.base` + exit 1; 미존재 키 → `error[TOK-UNKNOWN-REF]` + `from:`/`to:` + exit 1. 두 경우 모두 `no output written`, 이전 `tokens.css` 바이트 동일 보존(원자적 쓰기). 복원 후 재빌드 결과 원본과 바이트 동일 | 2026-07-10 |
| WP-004 | TypeScript·JSON 산출과 타입 | REL-001 | done | `8c85504` | `dist/tokens.js`, `tokens.d.ts`(287줄), `tokens.json`(202 토큰), `breakpoints.{js,d.ts}` 산출. 산출 `.d.ts` 3종의 `any` 0건. `tokens.json`이 key·tier·usage·description 메타데이터 보유. `usage` 분류 검증: `status.neutralEnd`=decorative(CR-006), `status.queued`=nonText, `focusRing`=nonText, `border.control`=nonText | 2026-07-10 |
| WP-005 | 타이포·z-index·브레이크포인트 스케일 | REL-001 | done | `8c85504` | `font.size` 7단계(10/11/12/13/14/16/20px)와 대응 `font.lineHeight`, `z` 6단계(0/10/20/30/40/50, 중복 0), `breakpoint` 3단계(560/800/1080px). `breakpoints` 객체 별도 export(`./breakpoints` 진입점). `@media` 조건 내 `var(--cdt-breakpoint-*)` 0건. 치환기가 `var()` 형태와 `{breakpoint.sm}` 별칭 형태를 모두 처리 | 2026-07-10 |
| WP-006 | 토큰 린트와 계약 테스트 | REL-001 | done | `8c85504` | `pnpm lint:tokens` 동작. 픽스처 음성 테스트 4종 실증: 색 리터럴(`#ff0000`, `rgba()`) → `error[TOK-LITERAL]` + 파일:줄:열 + exit 1; px/ms/z-index/font-size 리터럴 4종 검출; **FR-THM-005 AC-3** — `--cdt-text-faint`가 `--cdt-surface-elevated` 배경 위에 칠해지면 `text-faint-on-elevated` 위반(2.94:1 명시) + exit 1; `/* cdt-allow-literal: <사유> */` 주석이 통과시키고 `--report`가 사유와 함께 출력. 테마 계약 테스트는 대칭 차집합 검사를 두 테마 픽스처로 증명하고 `themeSpecific` 예외를 리포트에 노출 | 2026-07-10 |
| WP-007 | 대비 검사기와 검사 쌍 정의 | REL-001 | done | `8c85504` | `contrast-pairs.ts`에 40쌍 선언(CP-001 ~ CP-041, **CP-025 결번 보존** — CR-006). `pnpm check:contrast` 40/40 통과, 미달 0건, 제외 165 토큰(사유 포함). WCAG 2.1 상대 휘도 + alpha 합성. **오케스트레이터의 독립 WCAG 구현으로 40쌍 전부 교차 검증 — 불일치 0건(허용 오차 0.02).** 음성 테스트(실제 주입): `text.muted`를 `#3a4555`로 바꾸자 CP-006(2.03)·CP-007(1.59)·CP-040(1.69) 3쌍 실패, `check:contrast` exit 1, **빌드도 exit 1**, 쌍 ID·테마·측정값·기준값 출력. 복원 후 `contrast-report.json` 바이트 동일 | 2026-07-10 |
| WP-008 | `@conductor-by-89soone/css` 레이어 골격과 리셋 | REL-002 | done | `e151ccb` | 클린 체크아웃에서 게이트 7개 전부 exit 0(빌드 14초), 테스트 319 passed / 19 files. `dist/index.css` 9,163바이트 → **gzip 2,575바이트**(NFR-001 예산 20,480). `dist/component.css` gzip 2,392바이트. 두 산출물 모두 `!important` 0건, 레이어 밖 규칙 0건, `@import` 잔존 0건, 비-`--cdt-` 커스텀 프로퍼티 0건. **음성 테스트(실제 주입)**: `!important` → `error[CSS-IMPORTANT]` + exit 1; 레이어 밖 규칙 → `error[CSS-UNLAYERED]` + exit 1; 원격 `@import` → `error[CSS-REMOTE-FONT]` + exit 1(리졸버 단계); `@font-face src: url(https://)` 및 프로토콜 상대 `//` → `error[CSS-REMOTE-FONT]` + exit 1(AST 단계); 비-`--cdt-` 커스텀 프로퍼티 → `error[CSS-CUSTOM-PROPERTY]` + exit 1. 5회 실패 전부에서 `dist/` 바이트 동일 보존(원자적 쓰기). `lint:tokens` 스캔 대상이 6 → 14 파일로 늘어 처음으로 실질 동작; 허용 주석 제거 시 `px-literal` 2건, 색 리터럴 주입 시 `color-literal` 1건으로 exit 1 실증 | 2026-07-11 |
| WP-009 | 레이아웃 프리미티브 클래스 | REL-002 | done | `e151ccb` | 5개 클래스가 `cdt.layout`에 존재하고 색상 선언 0건. `cdt-split-layout`은 md 토큰(800px), `cdt-card-grid`는 sm 토큰(560px)에서 단일 컬럼. 카드 최소 열은 `--cdt-card-grid-min-column`(320px) 사용. CSS 빌드가 공개 `@conductor-by-89soone/tokens/breakpoints` 값으로 미디어 참조를 치환하며 산출물의 breakpoint CSS 변수 0건. CSS 57/57, 전체 330/330 테스트 통과. lint/lint:deps/build/typecheck/test/lint:tokens/check:contrast 전부 exit 0. gzip index 2,772B, component 2,589B. CR-012로 검증 명령의 stale dist 결함 수정 | 2026-07-11 |
| WP-010 | 라이트 팔레트와 테마 결정 계약 | REL-002 | done | `0d6c149`, `58b2a17` | `palette.light.ts`가 명세 6절의 파생값을 다크 메타데이터와 같은 키 집합으로 선언하고, component 재정의 8건(글래스 대안·정책 비활성 텍스트 등)을 적용. `tokens.css`는 명시 `data-cdt-theme` 속성을 우선하고 속성 부재 시 OS light만 라이트로 폴백하며 무효값은 다크로 귀결. `pnpm check:contrast` 다크·라이트 80/80, `pnpm test` 332/332, typecheck·lint:tokens 통과 | 2026-07-11 |
| WP-011 | `@conductor-by-89soone/react` 골격과 공통 계약 | REL-002 | done | `a46af8d` | React 18/19·react-dom·lucide peer 계약과 `sideEffects: false` 선언. 첫 레지스트리 소비자 스모크에서 0.x caret가 0.400.x만 허용하는 DEV-019를 발견해 실제 개발·문서 범위인 `lucide-react >=0.400.0 <2`로 정정하고 patch changeset을 추가했다(CR-026) | 2026-07-17 |
| WP-012 | 액션·표면 컴포넌트군 | REL-002 | done | `f1534a1` | Button·IconButton·Card·CardGrid·Panel과 `cdt.component` CSS 구현. variant/loading/disabled/blocked, IconButton 필수 aria-label, Card 요소 자동 선택·중첩 대화형 경고, 공유 계약·SSR registry까지 검증. React 48/48, CSS 60/60, lint:tokens 통과 | 2026-07-11 |
| WP-013 | 상태 표시 컴포넌트군 | REL-002 | done | `66ea60a` | Badge·StatusBadge·SeverityTag와 상태·심각도 토큰/CSS, React·CSS 테스트 구현 | 2026-07-11 |
| WP-014 | 데이터 표시 컴포넌트군 | REL-002 | done | `94a190c` | Table·Timeline·CodeBlock·Kbd와 토큰/CSS, React·CSS 테스트 구현 | 2026-07-11 |
| WP-015 | 오버레이 컴포넌트군 | REL-002 | done | `95f8bba` | Radix Dialog·Drawer·Tooltip·DropdownMenu와 CSS·SSR/상호작용 테스트 구현 | 2026-07-11 |
| WP-016 | 폼 컴포넌트군 | REL-002 | done | `ce00050` | `pnpm --filter @conductor-by-89soone/react test -- form` 121/121, CSS 72/72, build/typecheck/test/lint:deps/lint:tokens/check:contrast 통과. `pnpm lint`는 이번 WP와 무관한 기존 `testing/contract.test.tsx` ESLint 오류 3건으로 실패 | 2026-07-11 |
| WP-017 | 피드백 컴포넌트군 | REL-002 | done | `ce00050` | `feedbackMeter.*`와 semantic `surface.track`을 추가해 CR-013 해소. build/typecheck/test(467)/CSS(72)/lint:tokens/check:contrast 통과; `pnpm lint`의 기존 오류 3건은 WP-016부터 동일 | 2026-07-11 |
| WP-018 | 문서 사이트 셸과 테마 토글 | REL-003 | done | `2ff2b0d` | Vite 정적 빌드, React Router 셸, 테마 저장/OS 폴백/첫 페인트 스니펫, 모바일 Drawer. Playwright 4/4 통과 | 2026-07-11 |
| WP-019 | Getting Started와 Foundations 화면 | REL-003 | done | `2ff2b0d` | Getting Started 설치/캐스케이드/SSR 안내와 `tokens.json` 기반 Foundations 5화면, 설명 누락 빌드 경고, Playwright 6/6 통과 | 2026-07-11 |
| WP-020 | 컴포넌트 카탈로그와 라이브 프리뷰 | REL-003 | done | `2ff2b0d` | `.d.ts` 기반 ComponentMeta·props 표, 공개 27개 카탈로그/상세 라우트, variant×tone 프리뷰, 오류 경계. Playwright 9/9 통과 | 2026-07-11 |
| WP-021 | 토큰 참조 화면 | REL-003 | done | `2ff2b0d` | 전체 공개 토큰의 두 테마 값·키 필터·대비 리포트·장식 전용 사유·리포트 누락 폴백. Playwright 11/11 통과 | 2026-07-11 |
| WP-022 | Patterns·Accessibility 화면과 코드 복사 | REL-003 | done | `2ff2b0d` | W-040 권장/금지 실제 렌더·상태/심각도/밀도/오버레이 규칙, W-050 대비·키보드·axe 허용 목록, W-021 코드 복사와 폴백. Playwright 15/15 통과 | 2026-07-11 |
| WP-023 | 셸 컴포넌트군 | REL-003 | done | `5ced36a` | AppShell·NavList·TopBar와 shell token/CSS, public registry/SSR/공통 계약을 구현하고 docs 자체 셸을 공개 컴포넌트 소비로 전환. 전체 485/485, React 142/142, CSS 76/76, Playwright 16/16, lint·lint:tokens·typecheck·contrast·strict validator 통과 | 2026-07-12 |
| WP-024 | 접근성 검사 CI 잡 | REL-003 | done | `1bdfe8b` | Vitest browser + Playwright Chromium에서 공개 30개·49상태×2테마 axe, 30개 키보드 경로, overlay Escape/이탈, focus-visible, cascade를 검증. 정상 164 passed/1 fixture skipped, critical `button-name` fixture는 exit 1. main Node 22가 Dialog 진입 opacity 4.6% 프레임을 잡던 DEV-021은 유한 animation 완료 뒤 axe를 실행해 해소했고 로컬 전체 게이트 4회 연속 통과(CR-028). 무한 Spinner는 대기만 제외하고 계속 감사한다. axe JSON/실패 screenshot CI 아티팩트 30일 보존 | 2026-07-17 |
| WP-025 | 번들 크기 검사 CI 잡 | REL-003 | done | `f0318f9` | `size-limit` 11.2 기반 `pnpm size` 게이트. Button 단독 527바이트/4KB, CSS 7,720바이트/20KB, React·CSS `sideEffects` 계약을 검증한다. 1바이트 제한 음성 픽스처는 exit 1과 기여 청크를, 누락 진입점 픽스처는 측정 실패 exit 1을 실증한다. `size-report.json`은 CI 아티팩트로 30일 보존 | 2026-07-12 |
| WP-026 | 시각 회귀 검사 | REL-004 | done | `6a5d5a4` | digest 고정 Playwright 1.61.1 Noble 컨테이너에서 대표 12개 컴포넌트×2테마=24 기준 이미지를 비교한다. 정상 3회가 각 25/25(diff 0), 36% Button 차이 픽스처는 exit 1과 actual/expected/diff를 생성했다. 일반 실행은 기준 이미지를 갱신하지 않고 `--update`만 허용한다 | 2026-07-12 |
| WP-027 | Changesets와 npm 배포 워크플로 | REL-004 | done | `4411aa1` | version PR #2와 OIDC Release run 29569125471로 0.1.0 3종·SLSA provenance v1 게시, actual rollback 323.8초. React 0.1.1도 version PR #4와 Release run 29586062062로 OIDC 게시·provenance·annotated tag 검증을 통과했다. DEV-018 tag 무음 실패는 CR-025, DEV-022 CRLF 파싱은 CR-029, DEV-023 version commit 이중 Changeset 검사는 구조 분류 후 skip하는 CR-030으로 해소 | 2026-07-17 |
| WP-028 | 문서 사이트 정적 배포 | REL-004 | done | `705410e` | 라우트 코드 분할(첫 청크 361kB→셸만)과 랜딩 프리렌더로 Fast 3G LCP p75 1,793ms/2,500ms 달성. `pnpm lighthouse`가 정적 서빙 렌더·외부 도메인 요청 0건·LCP 예산을 게이트하고, `deploy-docs.yml`이 main push의 triggering SHA를 GitHub Pages 원자적 스냅샷으로 자동 배포한다. 수동 `ref`는 롤백/재배포에만 쓴다(CR-032). 프리렌더 격리 A/B에서 클라이언트 전용은 3,580ms로 예산 초과 | 2026-07-18 |

상태값: `todo` / `in_progress` / `done` / `blocked`

### CR-018 교차 WP 유지보수 (2026-07-15)

사용자 요청에 따른 컴포넌트 시각 정제는 새 WP를 만들지 않고 기존 WP-005·WP-008·WP-012~017·WP-020·WP-024·WP-026의 유지보수로 수행했다. 공개 React API와 Radix 접근성 책임은 유지했다. additive `radius.pill` 토큰은 API 추출 기준과 Changeset에 기록했다.

| 범위 | 결과 |
| --- | --- |
| 시각 구현 | Card/Overlay 깊이, Button variant×tone, Table 계층, Form/Select/Switch 상태, Banner 중립 표면 + 상태 rail, EmptyState/Meter/Progress 정제 |
| DEV-011 | `radius.pill` 누락, `Select.Content` 자식 유실, Button 조합 우선순위 오류를 실제 Chromium 스냅샷에서 발견해 수정 |
| 토큰/대비 | 338개(primitive 74 / semantic 89 / component 175), CSS 264 선언, 다크·라이트 80/80 통과 |
| 정적 검증 | build·typecheck·lint·lint:deps·lint:tokens(42파일, 위반 0)·check:api(3리포트, `any` 0)·check:changesets 통과 |
| 단위/접근성 | Vitest 488/488, axe/keyboard 134 passed + 음성 픽스처 1 skipped, 허용 예외 0 |
| 브라우저 | 문서 E2E 16/16, 고정 Chromium 시각 회귀 25/25(diff 0), 다크·라이트 기준 이미지 24장 갱신 |
| 예산 | Button 527B/4KB, CSS 8.11KiB/20KiB |
| 문서 | validator `--report`·`--strict` 모두 구조·추적성 오류 0 |

### CR-019 교차 WP 유지보수 (2026-07-15)

공식 디자인 시스템과 접근성 문서의 반복 패턴을 Conductor의 기존 공개 API 안에서 적용했다. 채택 수치는 만족도의 직접 측정이 아니라 지속 사용의 보조 신호로만 사용했고, 실제 변경은 기존 컴포넌트의 계층·라벨·상태·합성 결함에 한정했다.

| 범위 | 결과 |
| --- | --- |
| 시각 구현 | Button 14px 행동 라벨, Field 라벨 `text.secondary`/600, 대화형 Card pressed 평면 복귀, 카탈로그 정적 Panel + 명시적 링크 |
| DEV-012 | 장식 그림자가 포커스 링을 덮고 전환 첫 프레임이 투명해지던 결함을 component-layer `focusRing` + `transition: none`으로 해소 |
| 토큰/대비 | 338개(primitive 74 / semantic 89 / component 175), CSS 264 선언, 다크·라이트 80/80 통과 |
| 정적 검증 | build·typecheck·lint·lint:deps·lint:tokens(42파일, 위반 0)·check:api(3리포트, `any` 0)·check:changesets·check:secrets 통과 |
| 단위/접근성 | Vitest 488/488, CSS 78/78, React 142/142, axe/keyboard 134 passed + 음성 픽스처 1 skipped |
| 브라우저 | 문서 E2E 16/16, 고정 Chromium 시각 회귀 25/25(diff 0), 변경 기준 이미지 10장 갱신 |
| 예산 | Button 527B/4KB, CSS 8.15KiB/20KiB |
| 문서 | validator `--report`·`--strict` 모두 구조·추적성 오류 0 |

### CR-021 QA·hydration 종결 유지보수 (2026-07-15)

승인된 SRS와 화면 QA를 실제 소스에 다시 대조해 미구현 화면 예시와 예외 흐름을 완성했다. 공개 패키지 API·요구사항 범위는 바꾸지 않았으며, 루트 전용 프리렌더를 딥링크에서도 hydrate하던 DEV-014는 hydration 경계 수정과 실제 브라우저 회귀 테스트로 종결했다.

| 범위 | 결과 |
| --- | --- |
| 소비자 흐름 | `@conductor-by-89soone/css` 누락 개발 경고 1회, 설치 → CSS → theme → Button 문서 순서, SSR 브라우저 전역 금지 안내 |
| Foundation/카탈로그 | 의미별 token preview, `clamp()` 제목, 실제 split/card-grid, live reduced-motion 계산값·상태 비교, React 없는 primary Button 계산 스타일 대조 |
| hydration | 공개 30개 전수 server node 보존·recoverable error 0. `/`은 프리렌더 DOM을 보존하고 딥링크는 루트 전용 마크업을 제거한 뒤 hydration 경고 없이 client mount |
| 화면 QA | 12개 화면 × 다크/라이트 × 560/800/1080에서 clipping·문서 overflow 0. 두 테마의 모든 화면에서 DOM 순서와 Tab 순서 일치 및 focus-visible box-shadow 확인 |
| 접근성/이상 흐름 | 공개 30개·상태/심각도 그레이스케일 3장, preview error·Clipboard 거부·대비 리포트 누락·localStorage 차단·정적 progress fallback 검증 |
| 정적/단위 게이트 | build·typecheck·lint·lint:deps·lint:tokens(45파일, 위반 0)·contrast 80/80·API 3리포트(`any` 0)·changeset 3개·secret 243파일 통과. Vitest 489/489 |
| 브라우저 게이트 | 문서 E2E 37/37, axe/hydration 164 passed + 음성 픽스처 1 skipped, 고정 Chromium 시각 회귀 27/27(diff 0) |
| 예산/문서 | Button 552B/4KB, CSS 8.15KiB/20KiB. Lighthouse performance 98, LCP 최근 7회 p75 1,917ms, CLS 0.000, 외부 요청 0. validator `--report`·`--strict` 오류 0 |
| 릴리스 잔여 | 실제 npm semver publish, OIDC trusted publishing, npm/Pages 10분 롤백 리허설만 외부 게이트로 남김 |

### CR-022 실제 릴리스 권한·도구체인 감사 (2026-07-15)

GitHub 연결 계정 `89sooner`가 private 저장소 `89sooner/design-system`의 admin임을 확인했다. 로컬 `gh` 토큰은 만료됐고 npm CLI는 미로그인 상태다. npm registry 조회에서 `@conductor-by-89soone/tokens`, `@conductor-by-89soone/css`, `@conductor-by-89soone/react`는 모두 404로 미게시 상태였으며, npm 조직·2FA·Trusted Publisher 설정은 계정 소유자의 대화형 작업으로 남겼다.

| 범위 | 결과 |
| --- | --- |
| 도구체인 | npm 공식 최소 Node 22.14.0/npm 11.5.1을 확인하고 release job을 Node 22.14.0/npm 11.18.0으로 고정 |
| provenance | 저장소가 private이면 npm provenance가 생성되지 않으므로 release preflight가 게시 전에 명시적으로 실패하도록 고정 |
| 최초 게시 | 존재하지 않는 패키지는 Trusted Publisher 등록이 불가능하다. `0.0.0` 3종을 `bootstrap` dist-tag로 1회 대화형 게시한 뒤 패키지별 `release.yml` 신뢰 관계를 등록하는 순서를 문서화 |
| 게시 dry-run | `pnpm --filter <package> publish --dry-run --tag bootstrap --access public --no-git-checks`를 tokens → css → react 순서로 통과. CSS/React tarball에서 `workspace:*`가 `0.0.0`으로 치환됨을 확인. Changesets는 정식 릴리스 3종 모두 minor로 계산 |
| 권한 경계 | GitHub admin은 검증됨. npm org 생성·2FA·최초 publish·Trusted Publisher 등록, GitHub repository public 전환과 Pages source 설정은 사용자 대화형 작업 |
| 공개 전 보안 | 기존 scanner가 현재 추적 파일만 보던 DEV-016을 수정해 추적·미추적 247개 파일과 전체 Git 이력을 검사. 실제 이력 0건, 합성 GitHub PAT 1건은 exit 1 확인 |
| 정식 릴리스 | bootstrap 이후 version PR 병합 → `release.yml` 수동 실행 → OIDC/provenance 확인 순서. 장기 `NPM_TOKEN`은 생성·저장하지 않음 |

### 첫 공개 릴리스·롤백 실증 (2026-07-17)

| 범위 | 실제 결과 |
| --- | --- |
| GitHub | `89sooner/design-system` public, version PR #2 병합 SHA `1c6f628`, main CI run 29567731136 성공 |
| npm 정식 릴리스 | Release run 29569125471 성공. `@conductor-by-89soone/{tokens,css,react}@0.1.0`을 OIDC로 게시했고 세 버전 모두 SLSA provenance v1 attestation 보유 |
| git 태그 | 첫 게시에서 Changesets의 annotated tag 생성이 Git identity 부재로 무음 실패한 DEV-018을 복구했다. 세 0.1.0 annotated tag가 릴리스 SHA를 가리키며, 향후에는 `check:release-tags`가 로컬·원격 object를 모두 강제한다(CR-025) |
| npm 소비자 스모크 | workspace 밖 `/tmp` 소비자에 레지스트리 0.1.0 3종·React 19를 설치하고 CSS import, dark theme, Button, tokens 사용을 `tsc --noEmit`으로 통과. 이 과정에서 lucide peer 범위 DEV-019를 발견·정정(CR-026) |
| npm 롤백 | 0.1.0 3종 deprecate와 `latest: 0.1.0 → 0.0.0` 실제 9단계가 323.8초에 완료. 레지스트리 원문으로 상태를 확인한 뒤 deprecation을 해제하고 `bootstrap=0.0.0`, `latest=0.1.0`, provenance 유지 상태로 복구 |
| Pages | `https://89sooner.github.io/design-system/` HTTP 200. 직전 정상 커밋 재배포 run 29568304495(214초)에서 구 scope를 확인하고 main 복원 run 29568605076(203초)에서 현재 scope를 확인 |
| React 0.1.1 | version PR #4 merge SHA `15024d2`, main CI run 29585593781 성공. 수동 Release run 29586062062가 OIDC로 게시했고 `latest=0.1.1`, deprecated 없음, SLSA provenance v1, npm signature, annotated remote tag가 merge SHA와 일치 |
| 0.1.1 소비자 스모크 | 격리 앱에서 npm 레지스트리 React 0.1.1·CSS/tokens 0.1.0·lucide-react 0.400.0을 설치해 `tsc --noEmit` 및 React 19 `renderToStaticMarkup` 통과 |

### CR-036 dataviz 차트 계열 색 (2026-08-29)

PR Search 소비처의 `DEV-380`이 트리거다: 화면 계약이 최대 20계열을 색으로 구분하라고 요구하는데 Conductor에 계열용 색 토큰이 없었다. semantic 색 계열 `dataviz`를 추가했다.

| 범위 | 실제 결과 |
| --- | --- |
| 토큰 | `dataviz.series.1`~`20`(범주형)과 `dataviz.sequential.1`~`5`(순서형), 두 테마 각각 정의. `palette.dark.ts`(정본)·`palette.light.ts`(6절 파생), `usage`는 25키 모두 `nonText`. `schema.ts` `FIXED_GROUP_SIZES`에 `dataviz: 25`로 개수를 빌드에서 강제 |
| 대비 | 새 쌍 CP-043~CP-117(25키 × 3표면 `base`·`canvas`·`raised`). `pnpm check:contrast` 232/232 통과, 미달 0. 실측 최악 3.28(라이트 `sequential.1`), 범주형 다크 6.27~7.34·라이트 3.32~3.87, 순서형 다크 3.39~12.58·라이트 3.28~10.25 |
| 시험 | `palette.dark.test.ts` 화이트리스트에 25키 추가, `contrast-pairs.test.ts` 개수 41→116·연속성 42→117. `pnpm test` 522/522 통과, `pnpm typecheck` 통과 |
| 산출물 | `pnpm lint:tokens` 위반 0, `pnpm size` PASS(css 8.84 KiB/20 KiB), CSS 변수 `--cdt-dataviz-series-1`~`20`·`--cdt-dataviz-sequential-1`~`5` 방출 확인. 다크·라이트 두 값 존재 |
| 문서 | SRS v1.5(FR-TOK-005 AC-6, §12.1), 토큰 명세(§5.14, §8.2, §8.6), CR-036. 함께 CR-035가 남긴 §8.2 CP-042 행 누락·개수·§8.6 표기를 정정 |
| 릴리스 | `.changeset/dataviz-series-tokens.md`(tokens minor + css minor). `pnpm check:changesets` 통과. 실제 publish는 version PR 병합 후 수동 승인 게이트를 따른다 |
### PR #14·#15·#16·#18 머지 후 리뷰 종결 (2026-09-03)

0.3.0 발행 뒤 도착한 리뷰 여덟 건을 전수로 판정했다. 판정은 넷이며, 근거 없이 코드를 고치지도 근거 없이 닫지도 않았다.

| 리뷰 | 판정 | 근거 |
| --- | --- | --- |
| #14 P1 `motion.spin` CR 누락 · #15 P1 `DEV-032`·`DEV-033` CR 누락 | GOVERNANCE_VALID | 원장의 처리 CR 칸이 비어 있는 것이 사실이었다. `CR-037`이 사후 정정했다 |
| #14 P2 Meter RTL 채움 방향 | REPRODUCED | RTL 문서에서 트랙 480~880일 때 채움이 481~580.5 — 논리 시작(880)이 아니라 물리 왼쪽에서 자랐다. `DEV-035` |
| #15 P2 제거 버튼 조작 대상 | REPRODUCED | 실측 18×18. `IconButton` compact 계약은 34px다. `DEV-036` |
| #15 P2 Drawer RTL 방향 | REPRODUCED | RTL 컨테이너 300~900에서 `--right` 서랍이 801~1301(오른쪽 밖)부터 출발해 화면을 가로질렀다. 안착 위치는 301~801이다. `DEV-037` |
| #15 P2 `aria-sort="other"` | REPRODUCED | `other`와 `none`이 같은 `↕`(opacity 0.4)를 냈다. `DEV-038` |
| #16 P1 · #18 P2 배지 제거 버튼 포커스 링 | ALREADY_FIXED | `components.css`의 `.cdt-badge__dismiss.cdt-btn:not(:disabled):focus-visible`(0,4,0)이 hover 규칙 뒤에 이미 있었다. 키보드 Tab으로 만든 `:focus-visible`에서 focus 단독·hover 동시·active 동시 세 경로 모두 `rgba(79,91,213,.8) 0 0 0 3px`를 유지한다(LTR·RTL 동일). 코드 변경 0 |

`DEV-035`~`DEV-038`의 수정 결과는 브라우저 계산값으로 재확인했다.

| 범위 | 실제 결과 |
| --- | --- |
| Meter | RTL에서 채움이 779.5~879로 트랙 오른쪽 끝(880)에 붙는다. LTR은 21~120.5로 변화 없다 |
| Drawer | RTL에서 `--right`가 -199~301(왼쪽 밖), `--left`가 899~1399(오른쪽 밖)에서 출발한다. 둘 다 자기 안착 가장자리 바깥이다 |
| 제거 버튼 | `elementFromPoint`로 중심에서 상하좌우 16px·대각 11px·17px까지 버튼이 잡히고 19px에서 벗어난다(34×34). 인접 배지의 중심과 왼쪽 가장자리는 그대로 자기 요소를 가리킨다 |
| 정렬 표시기 | `other`의 `::after` `content`가 `none`이다. `none`은 `↕`(0.4), `ascending`은 `↑`(1)로 변화 없다 |
| 시험 | `bundle.test.ts`에 회귀 여덟(describe 셋). 변이 다섯 전부 킬 — 미터 원점 되돌림·keyframe 물리 리터럴·RTL 부호 미반전·적중 영역 축소·`[aria-sort]` catch-all 복귀 |
| 검증 | `pnpm test` 580/580 · `test:a11y` 164 통과(1 skipped) · `check:contrast` 232 중 0 실패 · `check:api` 3 report 정상 · `lint` 0건 · `lint:tokens` 0 위반 · `size` PASS(css 9.52 KiB/20 KiB) · docs e2e 41 통과 · `typecheck`·`build` 통과 |
| 릴리스 | `.changeset/rtl-direction-aware-motion.md`·`.changeset/dismiss-target-and-sort-indicator.md`(둘 다 css patch). `check:changesets` 2건 0 위반 |

## 3. 요구사항 → 코드/테스트 매핑 표

`srs_final.md` §9에 승인된 FR 49개 전부를 나열한다. 구현 모듈·테스트 파일·WP 열은 코드가 작성될 때 채운다.

| FR ID | 구현 모듈 | 테스트 파일 | WP | 상태 |
| --- | --- | --- | --- | --- |
| FR-TOK-001 | `packages/tokens/src/lint-cli.ts`, 토큰 소스 5종 | `packages/tokens/src/*.test.ts`, 픽스처 음성 테스트 | WP-002, WP-006 | 검증됨 (AC-1~AC-3 + 허용 주석 예외. 색·px·**rem**·ms·z-index·font-size 리터럴을 파일:줄:열과 함께 exit 1로 차단. 대상은 `packages/css`·`packages/react`·`apps/docs/src`이며 생성물 디렉터리는 스캔에서 제외한다 — CR-033) |
| FR-TOK-002 | `src/schema.ts`, `src/build/tiers.ts` | `src/build/tiers.test.ts` | WP-002 | 검증됨 (AC-1~AC-6. CR-008 반영. 역방향 주입 시 exit 1 + 위반 키 쌍 실증) |
| FR-TOK-003 | `src/build/reference.ts`, `src/build/write.ts` | `src/build/reference.test.ts`, `src/build/build.test.ts` | WP-003 | 검증됨 (AC-1~AC-4 + 예외. 순환·미존재 키 주입 시 exit 1, 이전 산출물 보존 실증) |
| FR-TOK-004 | `src/build/names.ts`, `src/build/emit-css.ts` | `src/build/names.test.ts`, `src/build/emit-css.test.ts` | WP-003 | 검증됨 (AC-1~AC-4 + 이름 충돌 예외. 202 선언 전부 `--cdt-`, primitive 유출 0) |
| FR-TOK-005 | `src/palette.dark.ts`, `src/palette.light.ts`, `src/schema.ts` | `src/palette.dark.test.ts` | WP-002, WP-010 | 검증됨 (AC-1~AC-5. 두 테마가 동일 상태·심각도·미터 키와 icon 메타데이터를 유지. AC-6: dataviz `series` 20 + `sequential` 5 = 25키가 두 테마에 `nonText`로 존재하고 `FIXED_GROUP_SIZES.dataviz`로 개수를 강제, CP-043~CP-117로 3:1 검사 — CR-036) |
| FR-TOK-006 | `src/build/emit-ts.ts`, `src/build/emit-json.ts` | `src/build/emit-artifacts.test.ts` | WP-004 | 검증됨 (AC-1~AC-4. 산출 `.d.ts`의 `any` 0건) |
| FR-TOK-007 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-4) |
| FR-TOK-008 | `src/scales.ts` | `src/scales.test.ts` | WP-005 | 검증됨 (AC-1~AC-3) |
| FR-TOK-009 | `packages/tokens/src/scales.ts`, `src/build/media.ts`, `packages/css/build.mjs`, `packages/css/checks.mjs` | `packages/tokens/src/scales.test.ts`, `packages/css/test/bundle.test.ts`, `test/checks.test.ts` | WP-005, WP-009 | 검증됨 (AC-1~AC-3. CSS 소스의 `{breakpoint.sm}`·`{breakpoint.md}`가 공개 `@conductor-by-89soone/tokens/breakpoints` 값으로 560px·800px 리터럴 치환되고 산출 미디어 조건의 breakpoint CSS 변수 0건. `CSS-MEDIA-VAR` 음성 테스트 포함) |
| FR-THM-001 | `src/palette.dark.ts`, `src/token-source.ts`, `src/build/emit-css.ts` | `src/palette.dark.test.ts`, `src/build/emit-css.test.ts` | WP-002, WP-010 | 검증됨 (AC-1~AC-4. 다크 소스 1:1·별칭·키 대칭 및 `color-scheme: dark`) |
| FR-THM-002 | `src/palette.light.ts`, `src/token-source.ts`, `src/build/emit-css.ts` | `src/theme-contract.test.ts`, `src/contrast/check.test.ts`, `src/build/emit-css.test.ts` | WP-010 | 검증됨 (AC-1~AC-4. 키 대칭, light color-scheme, 불투명 라이트 경계 3:1 이상, elevation alpha 차이) |
| FR-THM-003 | `src/token-source.ts`, `src/build/emit-css.ts`, `apps/docs/src/theme.ts` | `src/build/emit-css.test.ts`, `apps/docs/e2e/shell.spec.ts` | WP-010, WP-018 | 검증됨 (CSS 명시 속성 우선·OS 폴백·무효값 다크, 문서 사이트 토글이 속성만 변경하고 컴포넌트를 재마운트하지 않음) |
| FR-THM-004 | `src/contrast-pairs.ts`, `src/contrast-cli.ts` | `src/contrast-pairs.test.ts`, `src/contrast/check.test.ts` | WP-007, WP-010 | 검증됨 (AC-1~AC-4. 두 테마 232/232 통과(dataviz CP-043~CP-117 포함, CR-036), alpha 합성 포함. 금지 조합 FP-001·FP-002는 별칭 종점까지 해석해 `TOK-CP-FORBIDDEN`으로 차단하고 매 실행에 재측정한다 — CR-035) |
| FR-THM-005 | `src/palette.dark.ts`, `src/contrast-pairs.ts`, `src/lint-cli.ts` | `src/palette.dark.test.ts`, `src/contrast-pairs.test.ts` | WP-002, WP-006, WP-007 | 검증됨 (AC-1 focusRing 3.93/3.56, AC-2 border.control 3.23, AC-3 lint 차단 + 금지쌍 FP-001 실증, AC-4~AC-7 usage 분류. CR-035 반영: `status.neutralEnd`=nonText `#94a3b8`, CP-042로 다크 6.61 · 라이트 8.58, CP-025는 영구 결번) |
| FR-CSS-001 | `packages/css/src/layers.css`, `src/reset.css`, `src/base.css`, `src/utility.css`, `packages/css/checks.mjs`, `build.mjs` | `packages/css/test/bundle.test.ts`, `test/checks.test.ts`, `packages/react/src/testing/a11y.browser.test.tsx` | WP-008, WP-024 | 검증됨 (AC-1~AC-4 + Radix 예외. 산출물 첫 줄이 5레이어 선언, `!important` 0건, 레이어 밖 규칙 0건. 음성 테스트로 `CSS-IMPORTANT`·`CSS-UNLAYERED`·`CSS-UNKNOWN-LAYER` 각각 exit 1 실증. AC-3은 Chromium에서 unlayered 소비자 규칙이 `cdt.component` Button 규칙을 덮는 계산값으로 확인) |
| FR-CSS-002 | `packages/css/src/reset.css`, `src/utility.css` | `packages/css/test/bundle.test.ts` | WP-008 | 검증됨 (AC-1~AC-5 + 예외 처리. `box-sizing: border-box`가 `*`·`::before`·`::after`에, `font: inherit`가 `button`·`input`·`textarea`·`select`에, `:focus-visible`이 `var(--cdt-focus-ring)` 그림자와 `outline: none`에 적용. 원격 폰트 참조 0건을 두 단계(리졸버·AST)에서 차단. `cdt-sr-only`·`cdt-skip-link`가 `cdt.utility`에 존재. 예외 처리인 `./component.css`(리셋 제외 산출물)를 실제로 산출) |
| FR-CSS-003 | `packages/css/src/layout.css`, `packages/css/build.mjs` | `packages/css/test/bundle.test.ts` | WP-009 | 검증됨 (AC-1~AC-4. 5개 클래스가 `cdt.layout`에 존재, split 800px·card-grid 560px 반응형 단일 컬럼, 최소 열 토큰 값 320px의 `auto-fill`, 색상 속성 0건) |
| FR-CSS-004 | `packages/css/src/components.css`, `packages/react/src/action.tsx`, `src/surface.tsx` | `packages/css/test/bundle.test.ts`, `packages/react/src/testing/action.test.tsx`, `surface.test.tsx`, `a11y.browser.test.tsx` | WP-012, WP-024 | 검증됨 (AC-1~AC-4. 접두사/BEM·구조 셀렉터 금지를 정적 검사하고, raw `cdt-btn cdt-btn--primary`와 React `Button variant="primary"`의 핵심 계산 스타일이 Chromium에서 일치) |
| FR-CSS-005 | `packages/css/src/base.css`, `src/components.css` | `packages/css/test/bundle.test.ts`, `apps/docs/visual/visual.spec.ts` | WP-008, WP-026 | 검증됨 (AC-1~AC-4 및 예외 처리. CR-014로 컴포넌트 전환을 live `--cdt-motion-*`에 연결하고 테마 선언보다 감소 모드 재정의 명시도를 높였다. standalone Chromium에서 media match=true, 모션 토큰·transition·animation 계산값 전부 0s를 확인) |
| FR-CMP-001 | `packages/react/src/cx.ts`, `src/types.ts`, `src/testing/contract.tsx`, `src/testing/public-components.ts` | `src/testing/contract.test.tsx`, `src/testing/public-components.test.ts`, 컴포넌트군별 테스트 | WP-011, WP-012~017, WP-023 | 검증됨 (공개 30개 전수에 ref 전달·className 병합·data/aria 통과·네이티브 props 공유 계약을 실행하고 registry가 테스트 파일·SSR을 강제) |
| FR-CMP-002 | `packages/react/src/action.tsx`, `packages/css/src/components.css` | `packages/react/src/testing/action.test.tsx`, `packages/css/test/bundle.test.ts` | WP-012 | 검증됨 (AC-1~AC-5 및 loading+disabled 예외. Button 3 variant, loading click 차단, IconButton aria-label 타입, native disabled/blocked) |
| FR-CMP-003 | `packages/react/src/surface.tsx`, `packages/css/src/components.css`, `src/data.tsx` | `packages/react/src/testing/surface.test.tsx`, `data.test.tsx`, `packages/css/test/bundle.test.ts` | WP-012, WP-014 | 검증됨 (AC-1~AC-4. Card의 대화형 요소 전환·상승·중첩 경고와 Table 자체 스크롤 컨테이너를 검증.) |
| FR-CMP-004 | `packages/react/src/status.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/status.test.tsx`, `packages/css/test/bundle.test.ts` | WP-013 | 검증됨 (AC-1~AC-5. Badge·StatusBadge·SeverityTag가 색·아이콘·텍스트 세 채널을 렌더하고, 7개 상태/4개 심각도 타입 및 `aria-hidden` 아이콘을 테스트한다. queued·neutralEnd는 토큰 명세에 따라 점+텍스트 마커 형태를 쓴다.) |
| FR-CMP-005 | `packages/react/src/data.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/data.test.tsx`, `a11y.browser.test.tsx`, `packages/css/test/bundle.test.ts` | WP-014, WP-024 | 검증됨 (AC-1~AC-5. Table 스크롤 컨테이너의 기본 `tabIndex=0`, 숫자 셀/이름 경고, Timeline의 네이티브 button·div 전환, CodeBlock region·모노스페이스 스크롤, Kbd를 단위·Chromium에서 검증.) |
| FR-CMP-006 | `packages/react/src/overlay.tsx`, `packages/css/src/components.css`, `packages/react/package.json` | `packages/react/src/testing/overlay.test.tsx`, `packages/css/test/bundle.test.ts` | WP-015 | 검증됨 (AC-1~AC-5. 정확 고정 Radix Dialog/Tooltip/DropdownMenu wrapper가 Dialog·Drawer의 포커스/Escape/복귀/스크롤 잠금, Tooltip focus/Escape, z 토큰과 자체 접근성 동작 0건을 검증.) |
| FR-CMP-007 | `packages/react/src/form.tsx`, `packages/css/src/components.css`, `packages/react/package.json` | `packages/react/src/testing/form.test.tsx`, `packages/css/test/bundle.test.ts` | WP-016 | 검증됨 (AC-1~AC-5. Field의 id/설명/오류 연결과 오류 invalid 상태, 이름 없는 입력 경고, Radix Select/Switch/Checkbox의 역할·상태, 40px/compact 42px 스타일 및 공개 공통 계약을 검증.) |
| FR-CMP-008 | `packages/react/src/feedback.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/feedback.test.tsx`, `packages/css/test/bundle.test.ts` | WP-017 | 검증됨 (AC-1~AC-5. Banner live role/경고, EmptyState 슬롯, Meter threshold·range·텍스트, ProgressRing/Spinner 대체 텍스트와 reduced motion CSS를 검증.) |
| FR-CMP-009 | `packages/react/src/shell.tsx`, `packages/css/src/components.css`, `packages/tokens/src/components.ts` | `packages/react/src/testing/shell.test.tsx`, `packages/css/test/bundle.test.ts`, `apps/docs/e2e/shell.spec.ts` | WP-023 | 검증됨 (AC-1~AC-4. renderLink 위임·라우터 의존 0건·800px off-canvas의 scrim/Escape dismissal·skip-link focus 이동과 세 컴포넌트 공통 계약을 단위 및 실브라우저로 검증.) |
| FR-DOC-001 | `apps/docs/src/main.tsx`, `App.tsx`, `entry-server.tsx`, `vite.config.ts`, `scripts/prerender.mjs`, `packages/react/src/shell.tsx`, `.github/workflows/deploy-docs.yml` | `apps/docs/e2e/shell.spec.ts`, `scripts/check-lighthouse.mjs` | WP-018, WP-023, WP-028 | 검증됨 (AC-1~AC-4. 모든 W-001~W-050 라우트가 공개 AppShell/NavList/TopBar 안에서 렌더되고 workspace 공개 진입점만 소비한다. AC-3·AC-4는 파일 서빙과 SPA 폴백만 있는 서버에서 셸 렌더와 외부 도메인 요청 0건을 프로덕션 산출물로 실측해 닫았다.) |
| FR-DOC-002 | `apps/docs/src/foundations.ts`, `App.tsx`, `scripts/check-foundation-tokens.mjs` | `apps/docs/e2e/foundations.spec.ts` | WP-019 | 검증됨 (AC-1~AC-3. generated `tokens.json`을 직접 읽어 그룹별 표·스와치를 생성하고, 키·계층·현재 테마 값·용도를 렌더한다. 설명 누락은 `설명 없음`과 빌드 경고로 처리) |
| FR-DOC-003 | `apps/docs/scripts/build-component-catalog.mjs`, `src/catalog.tsx`, `App.tsx` | `apps/docs/e2e/catalog.spec.ts` | WP-020, WP-023 | 검증됨 (AC-1~AC-5. 공개 30개가 실제 DOM 프리뷰와 상세 라우트를 가지며 `.d.ts`에서 props 표를 생성한다. 프리뷰 누락은 빌드 실패, 렌더 오류는 경계로 격리) |
| FR-DOC-004 | `apps/docs/src/token-reference.tsx`, `scripts/build-contrast-report.mjs` | `apps/docs/e2e/tokens.spec.ts` | WP-021 | 검증됨 (AC-1~AC-4와 리포트 누락 폴백. 빌드 산출 `tokens.json`·`contrast-report.json`을 소비하며 화면에서 대비율을 재계산하지 않음) |
| FR-DOC-005 | `apps/docs/index.html`, `src/theme.ts`, `src/App.tsx` | `apps/docs/e2e/shell.spec.ts` | WP-018 | 검증됨 (AC-1~AC-5와 localStorage 차단 폴백. 첫 페인트 스니펫이 React 전 루트 속성을 결정) |
| FR-DOC-006 | `apps/docs/src/guides.tsx`, `src/catalog.tsx` | `apps/docs/e2e/guides.spec.ts` | WP-022 | 검증됨 (AC-1~AC-3. 성공 공지·2초 복귀, polite live region, Clipboard 미지원 시 disabled/선택 가능 코드) |
| FR-DOC-007 | `apps/docs/src/guides.tsx` | `apps/docs/e2e/guides.spec.ts` | WP-022 | 검증됨 (권장/금지 실물 예, 금지 사유, 상태 7종·심각도 4종, Dialog/Drawer 기준, 생략 컴포넌트군 고지) |
| FR-A11Y-001 | `packages/css/src/reset.css`, `src/components.css` | `packages/css/test/bundle.test.ts`, `packages/react/src/testing/action.test.tsx`, `a11y.browser.test.tsx` | WP-008, WP-012, WP-024 | 검증됨 (공유 `:focus-visible` 토큰 규칙과 대체 표시 없는 `outline: none` 0건을 구조 검사하고, 다크·라이트 Chromium 키보드 포커스에서 실제 box-shadow 표시를 확인. focusRing 토큰 대비는 80/80 contrast gate에 포함) |
| FR-A11Y-002 | `packages/react/src/data.tsx`, `src/overlay.tsx`, `src/shell.tsx`, `src/testing/a11y-scenarios.tsx` | `packages/react/src/testing/a11y.browser.test.tsx`, `data.test.tsx`, `overlay.test.tsx`, `shell.test.tsx`, `apps/docs/e2e/shell.spec.ts` | WP-014, WP-015, WP-023, WP-024 | 검증됨 (공개 30개 전수 keyboard scenario가 static/focus/toggle/overlay/skip-link 경로를 실행. Dialog·Drawer·DropdownMenu·Select는 Escape 후 trigger 복귀와 외부 Tab 이탈, AppShell은 non-modal Escape 후 외부 이탈, Table/Timeline 도달을 Chromium에서 검증) |
| FR-A11Y-003 | `packages/react/src/status.tsx`, `src/form.tsx`, `src/feedback.tsx`, `packages/css/src/components.css` | React/CSS 단위 테스트, `apps/docs/visual/visual.spec.ts`, 그레이스케일 기준 이미지 3장 | WP-013, WP-016, WP-017, WP-026 | 검증됨 (AC-1~AC-3 상태·심각도 세 채널, 폼 오류, Meter 수치 텍스트와 AC-4 공개 30개 전수·상태 7종·심각도 4종 그레이스케일 구분을 고정 Chromium 스냅샷으로 검증) |
| FR-A11Y-004 | `src/contrast-cli.ts`, `.github/workflows/ci.yml` | `src/contrast-pairs.test.ts`, `src/contrast/check.test.ts` | WP-007, WP-010 | 검증됨 (AC-1~AC-4. 두 테마 232/232 미달 0건 — dataviz 비텍스트 150건(CP-043~CP-117) 포함, CR-036. decorative 제외·focusRing/border.control/status.neutralEnd 3:1 검사. §2·§8 등 날짜가 박힌 과거 기록의 80/80·82/82는 그 시점 값이라 보존한다) |
| FR-A11Y-005 | `packages/react/src/overlay.tsx`, `src/form.tsx`, `src/feedback.tsx`, `axe-allowlist.json` | `packages/react/src/testing/a11y.browser.test.tsx`, `overlay.test.tsx`, `form.test.tsx`, `feedback.test.tsx` | WP-015, WP-016, WP-017, WP-024 | 검증됨 (Banner alert/status, 장식 아이콘 숨김, Meter/Progress/Spinner 역할·live 상태와 공개 30개×주요 상태×두 테마의 axe serious/critical 0건을 검증. 허용 예외 0건이며 W-050이 실제 allowlist 파일을 표시) |
| FR-DX-001 | `scripts/check-deps.mjs`, 루트 `package.json` `build` 스크립트, `.github/workflows/ci.yml` | 의존 방향 음성 테스트, 각 패키지 스모크 테스트 | WP-001, WP-008 | 검증됨 (AC-1~AC-4. 클린 체크아웃 빌드 순서와 3분 예산, 역방향 의존 실패, 공개 진입점만을 통한 패키지 간 참조, 소스 상대경로 0건을 검증. 생성 타입 때문에 build 후 typecheck 순서를 CR-009로 고정) |
| FR-DX-002 | 각 패키지 `package.json`의 `exports`·`types`, `tsup` DTS 산출, `packages/react/src/types.ts`, `scripts/check-api.mjs` | `packages/*/src/index.test.ts`, `packages/react/src/index.test.ts`, `packages/tokens/src/build/emit-artifacts.test.ts`, `packages/*/etc/*.api.md`, 소비자 스모크(첫 공개 릴리스 표) | WP-001, WP-004, WP-011, WP-018, WP-027, WP-028 | 검증됨 (AC-1 `types`/`exports.types` 선언, AC-2 `any` 0건을 `check:api`가 상시 강제, AC-3은 workspace 밖 신규 앱이 tarball과 npm 레지스트리 0.1.0을 각각 설치해 `tsc --noEmit` 0 오류로 통과, AC-4 내부 타입 누출을 SRS가 지정한 공개 API 추출 리포트로 확인) |
| FR-DX-003 | `packages/tokens/package.json`, `packages/css/package.json`, `packages/react/package.json`, `packages/react/tsup.config.ts`, `scripts/check-size.mjs`, `.github/workflows/ci.yml` | `packages/tokens/src/index.test.ts`, `packages/css/test/exports.test.ts`, `packages/react/src/index.test.ts`, `pnpm size` 음성 픽스처 | WP-003, WP-008, WP-011, WP-025 | 검증됨 (AC-1~AC-4 및 예외 처리. 공개 exports·peer 선언과 React `sideEffects: false`·CSS `*.css` 보존을 검증한다. 멀티 엔트리 청크에서 Button 단독 gzip 527바이트/4KB, CSS 전체 7,720바이트/20KB이며 초과 시 exit 1과 기여 모듈을 출력한다.) |
| FR-DX-004 | `packages/react/src/testing/ssr.tsx`, `src/testing/public-components.ts`, `apps/docs/src/main.tsx`, `App.tsx` | `ssr.test.tsx`, `hydration.browser.test.tsx`, `apps/docs/e2e/shell.spec.ts` | WP-011, WP-018, WP-023 | 검증됨 (AC-1 공개 30개 renderToString 예외 0, AC-2 browser-global 접근 0, AC-3 공개 30개 server root 보존·recoverable error 0. 문서 `/` 프리렌더 DOM 보존과 딥링크 불일치 client mount 경계를 실제 Chromium에서 검증) |
| FR-DX-005 | `.changeset/config.json`, `scripts/check-changesets.mjs`, `scripts/is-version-packages-commit.mjs`, `scripts/check-api.mjs`, `scripts/check-release-tags.mjs`, `scripts/release-rollback.mjs`, `.github/workflows/release.yml` | `check:changesets`·version commit 양성/음성 분류·`check:api` 음성 픽스처, `changeset version`, 0.1.0/0.1.1 OIDC publish·provenance, annotated tag local/remote 검증, npm rollback 실증 | WP-027 | 검증됨 (AC-1 드리프트 exit 1 + major 규약, AC-2 CHANGELOG Refs와 LF/CRLF 동일 파싱, AC-3 react-only 0.1.1 bump 실증, AC-4 마이그레이션 노트 강제. 일반 commit의 `status --since`는 유지하고 이미 Changeset을 소비한 bot version commit만 구조 검증 후 skip. Release runs 29569125471·29586062062와 323.8초 실제 롤백으로 외부 경로까지 확인) |
| FR-QA-001 | `src/theme-contract.ts`, `src/token-source.ts` | `src/theme-contract.test.ts` | WP-006, WP-010 | 검증됨 (AC-1~AC-3. 실제 dark/light semantic·component 키 대칭과 `themeSpecific` 예외를 검사. `derivePalette`가 base에 없는 override 키를 `TOK-THEME-KEY`로 막아, 키 집합 비교만으로는 보이지 않는 오타 경로를 닫는다 — CR-035) |
| FR-QA-002 | `packages/react/src/testing/public-components.ts`, `src/testing/contract.tsx` | `src/testing/public-components.test.ts`, `src/testing/contract.test.tsx`, `src/testing/shell.test.tsx` | WP-011, WP-012~017, WP-023 | 검증됨 (AC-1 공개 30개 전수 테스트 파일·SSR registry, AC-2 FR/AC 명명, AC-3 공유 스위트와 컴포넌트군별 상호작용 테스트를 검증.) |
| FR-QA-003 | `vitest.a11y.config.ts`, `packages/react/src/testing/a11y-scenarios.tsx`, `axe-allowlist.json`, `.github/workflows/ci.yml` | `packages/react/src/testing/a11y.browser.test.tsx` | WP-024 | 검증됨 (공개 30개를 덮는 49개 기본/disabled/error/interactive/open scenario × 다크·라이트 = 98 axe 실행, serious/critical 0건. 유한 진입 animation 완료 뒤 안정 상태를 감사하고 무한 Spinner는 대기만 제외한다. 정상 164 passed/1 negative fixture skipped를 4회 연속 확인. fixture 활성화 시 `button-name(critical)` 검출과 exit 1을 실증. JSON report와 실패 screenshot을 30일 보존) |
| FR-QA-004 | `Dockerfile.visual`, `compose.visual.yml`, `scripts/test-visual.mjs`, `apps/docs/playwright.visual.config.ts`, `.github/workflows/ci.yml` | `apps/docs/visual/visual.spec.ts`, 기준 이미지 24장 | WP-026 | 검증됨 (REL-004 이월 구현. AC-1~AC-4: 12개×2테마, 1% 상한, 명시적 `--update`, Playwright 1.61.1 Noble digest 고정. 정상 3회 flake 0, 36% 음성 픽스처 exit 1과 diff 아티팩트 실증) **CR-034 기준 이미지 갱신 (2026-08-06)**: `h2`·`h3` 헤딩 스케일이 들어가면서 27장 중 16장이 1% 상한을 넘었다. 환경 요인을 배제하기 위해 같은 컨테이너에서 `main`(35f0d3b)을 먼저 돌려 27/27 통과를 확인했다. 16장의 diff는 전부 (a) 헤딩이 실제로 커진 것과 (b) 그 아래 내용이 세로로 밀리며 글리프·헤어라인이 재래스터화된 것이었고, 색·치수·형태 변화는 없었다. `pnpm test:visual --update`(FR-QA-004 AC-3)로 갱신한 뒤, 원래 통과하던 11장은 되돌렸다 — `--update-snapshots=all`이 그 11장까지 다시 쓰기 때문이다. **함께 발견된 사실**: Card-light 기준 이미지는 `surface.tint.1`이 존재하기 전(8e4d446)에 만들어졌고, 당시 `.cdt-card`의 `background` 단축 속성은 정의되지 않은 커스텀 프로퍼티 탓에 computed-value 시점에 무효가 되어 카드에 배경이 아예 없었다(옛 이미지의 좌상단·우하단이 모두 Panel 색 `(241,244,248)`). CR-031이 토큰을 추가해 고쳤지만 기준 이미지는 갱신되지 않았고, pixelmatch의 지각 허용치가 옅은 tint를 흡수해 게이트가 이를 잡지 못했다. 카드가 보이는 나머지 기준 이미지(Card-dark 등)도 같은 이유로 낡아 있으며, 통과 중이라 이번 커밋에서는 건드리지 않았다. |

상태값: `미착수` / `부분` / `구현됨` / `검증됨`

## 4. 편차(Deviation) 로그

**`CR-037`은 사후 정정이다.** `DEV-028`~`DEV-034`는 2026-09-03에 발견·수정돼 PR #14·#18·#19로 병합됐고 0.3.0이 그 상태로 발행됐다. 그 라운드는 "문서가 요구한 동작을 코드가 지키지 못한 것"으로 판정해 CR을 열지 않았는데, PR #14·#15의 머지 후 리뷰가 그 판정이 일곱 전부에는 맞지 않는다고 지적했고 그 지적이 옳았다 — `motion.spin` 토큰과 `cdt-badge__dismiss` 클래스는 공개 API를 넓혔고, `aria-sort` 표시기는 어느 AC도 승인한 적이 없었다. `CR-037`이 그 계약을 승인 범위로 들였다. **아래 행의 발견일·내용·상태는 당시 사실 그대로 보존한다** — 처리 CR 칸만 사후에 연결됐으며, CR이 구현보다 먼저 있었던 것처럼 읽어서는 안 된다.

| DEV ID | 발견일 | 유형 | 내용 | 관련 ID | 처리 CR | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| DEV-039 | 2026-09-03 | 문서 결함 | **원장이 소비처의 요구사항 ID를 자기 문서에 심어 문서 validator가 미상 ID로 잡았다.** `DEV-034`가 관련 ID 칸과 본문에 PR Search의 접근성 NFR(그쪽 007번)을 적었는데 이 저장소의 NFR은 001~005다. `validate_srs_prd_env.py --root .`가 그 ID를 `unknown requirement ID`로 냈다. **이 문단이 그 ID를 그대로 적으면 검사가 그것까지 세어 오류가 재현된다** — 검사는 코드 펜스나 인용을 가리지 않는다. 그래서 여기서는 번호만 서술한다. `CR-036`이 소비처의 `DEV-380`을 본문 서술로만 인용한 것이 옳은 선례다 — 다른 저장소의 ID는 출처를 밝혀 서술하되 자기 추적 칸에 넣지 않는다. 관련 ID 칸에서 빼고 본문을 `FR-A11Y-001` 기준으로 다시 적었다. 사실은 그대로 남는다. PR #20 머지 후 리뷰가 요구한 validator 기록에서 드러났다 | FR-A11Y-001 | 불필요 — 문서 표기 정정이며 요구사항 변경이 없다 | closed |
| DEV-038 | 2026-09-03 | 구현 편차 | `aria-sort`가 표현하지 않는 값에도 정렬되지 않은 상태의 글리프를 냈다. `.cdt-table__header-cell[aria-sort]::after` catch-all이 값을 가리지 않아, 네이티브가 허용하는 `aria-sort="other"`가 `none`과 똑같은 `↕`(opacity 0.4)를 받았다(실측). 보조 기술은 "다른 기준으로 정렬됨"을 읽는데 눈에는 "정렬 안 됨"이 보여 같은 열에 대해 둘이 다른 사실을 말했다. 값마다 셀렉터를 적어 `none`·`ascending`·`descending`만 그리고 나머지에는 아무것도 내지 않는다. PR #15 검토가 찾았다 | FR-CMP-005 AC-6, C-034 Table | CR-037 (계약) | closed |
| DEV-037 | 2026-09-03 | 구현 편차 | `Drawer` 진입·퇴장이 RTL에서 화면을 가로질렀다. 배치는 논리 속성(`inset-inline-end`·`inset-inline-start`)이 정하는데 이동은 물리 축(`translateX(±100%)`)이라, RTL에서 `--right` 서랍이 왼쪽에 안착하면서 오른쪽 밖(컨테이너 300~900에서 801~1301)부터 출발했다(실측). keyframe은 방향을 모르므로 `--cdt-drawer-shift`로 부호를 넘겨, 규칙 넷을 여덟으로 불리지 않고 두 방향이 같은 곡선을 쓰게 했다. PR #15 검토가 찾았다 | FR-CMP-006, C-046 Drawer | 불필요 — 공개 API를 넓히지 않는 구현 결함이다. 논리 배치와 물리 변형이 어긋난 것이며 승인된 계약(FR-CMP-006·008)이 이미 요구하는 동작을 되찾는다 | closed |
| DEV-036 | 2026-09-03 | 구현 편차 | 배지 제거 버튼의 조작 대상이 `IconButton`의 compact 계약(34px)을 배지 안에서만 18×18로 줄였다(실측). 보이는 크기를 배지 글자 높이에 맞춘 것은 알약 형태를 지키려는 것인데(DEV-033) 조작 영역까지 함께 줄어 있었다 — 문서화된 계약을 소리 없이 어기는 자리다. 투명한 의사 요소가 레이아웃을 바꾸지 않고 영역만 34×34로 넓힌다. gap 8px에서 인접 배지까지 7px 여유가 있어 옆 배지를 먹지 않는 것을 히트 테스트로 확인했다. PR #15 검토가 찾았다 | FR-CMP-004 AC-6, FR-CMP-002, C-014 Badge | CR-037 (계약) | closed |
| DEV-035 | 2026-09-03 | 구현 편차 | `Meter` 채움이 RTL에서 논리 시작 가장자리가 아니라 물리 왼쪽에서 자랐다. 백분율 `inline-size`이던 시절에는 논리 속성이 그 일을 했는데, 레이아웃 전환을 없애려고 `scaleX`로 바꾸면서(DEV-031) `transform-origin: left center`가 방향을 고정했다 — `transform-origin`에는 논리 키워드가 없다. RTL 트랙 480~880에서 채움이 481~580.5였다(실측). `:dir(rtl)`에서 원점을 뒤집는다. PR #14 검토가 찾았다 | FR-CMP-008, C-062 Meter | 불필요 — 공개 API를 넓히지 않는 구현 결함이다. 논리 배치와 물리 변형이 어긋난 것이며 승인된 계약(FR-CMP-006·008)이 이미 요구하는 동작을 되찾는다 | closed |
| DEV-034 | 2026-09-03 | 구현 편차 | **키보드로 포커스한 버튼에 마우스가 겹치면 포커스 표시가 완전히 사라졌다.** `cdt.reset`이 `outline: none`을 두고 링을 `box-shadow`로 그리는데, `.cdt-btn:not(:disabled):hover`(명시성 0,3,0)가 `.cdt-btn:focus-visible`(0,2,0)을 같은 레이어에서 이겨 링 그림자를 hover 그림자로 덮었다. Chromium 실측: 포커스만일 때 `rgba(109,124,255,0.8) 0 0 0 3px`, 포커스+hover일 때 링이 없고 hover 그림자만 남았다. WCAG 2.1 AA의 2.4.7 Focus Visible 위반이다 — 이 저장소의 접근성 기준선은 `FR-A11Y-001`이고, 소비처 PR Search에서는 같은 기준이 그쪽 접근성 NFR에 걸린다. **버튼에만 생겼다** — 같은 `focus-visible` 목록의 다른 여섯(`card--interactive`·`input`·`textarea`·`select__trigger`·`switch`·`checkbox`)은 안전하다 — `card--interactive`·`input`·`textarea`·`select__trigger`는 hover 규칙이 (0,2,0)이라 동률이고 `focus-visible`이 소스에서 뒤에 와 이기며, `switch`·`checkbox`는 애초에 `:hover` 규칙이 없어 겨룰 상대가 없다(소스 grep 0건, 브라우저 전수 실측). 버튼 셀렉터만 `.cdt-btn:not(:disabled):focus-visible`로 바꿔 명시성을 hover와 맞췄다 — 동률이면 소스 순서가 정하고 이 규칙이 모든 hover 규칙보다 뒤에 있다. 비활성 버튼은 포커스를 받지 않으므로 동작이 줄지 않는다. `!important` 없이 명시성으로만 해결했다(ADR-005). **문서 사이트 e2e 하나가 함께 드러났다**: `foundations.spec.ts`의 감소 모드 비교가 hover 상태를 잴 때, 같은 함수가 앞선 호출 끝에서 준 포커스가 남아 hover+focus를 읽고 있었다. 예전에는 hover가 링을 덮어 두 실행이 우연히 같았고 이제 갈린다 — 읽기 전에 포커스를 떼어 hover만의 상태를 재게 고쳤다(시험의 의도가 그것이다). **검토가 부분 수정임을 찾았다**: `DEV-033`이 만든 `.cdt-badge__dismiss.cdt-btn:not(:disabled):hover`는 명시성이 (0,4,0)이라 (0,3,0)으로 올린 공용 링 규칙을 여전히 이겨, 배지 제거 버튼에서는 결함이 그대로 남아 있었다(실측: 포커스+hover에서 `box-shadow: none`). 같은 명시성의 링 규칙을 그 뒤에 세워 닫았고, **개별 사례가 아니라 부류를 막는 시험**을 더했다 — 그림자를 칠하는 hover 규칙 중 링 규칙보다 명시성이 높거나(또는 같으면서 뒤에 오는) 것이 하나라도 있으면 실패한다. 그 시험은 `:hover`와 `:active` 둘을 함께 본다 — 키보드로 버튼을 누르면 `:active`와 `:focus-visible`이 함께 걸리기 때문이다(누름 상태에서 링이 유지되는 것은 실측으로 확인했다). 수정을 되돌리는 변이와 링 규칙을 앞으로 옮기는 변이 둘 다에서 이 시험이 실패하는 것을 확인했다. PR #15·#18 검토가 찾았다 | FR-A11Y-001, FR-CMP-002 | CR-037 (사후) | closed |
| DEV-033 | 2026-09-03 | 구현 편차 | 소비처 폴리시 검토가 브라우저 기본이 새어 나오는 자리 셋과 표시기 공백 하나를 찾았다. (1) `mark`가 UA 기본 형광 노랑(`rgb(255,255,0)`)에 검은 글자로 그려졌다 — 팔레트 어디에도 없는 색이고 다크 테마에서 특히 튄다. (2) `fieldset`이 UA 기본 `2px groove`에 좌우 여백을 가져, 필터 그룹을 시맨틱하게 묶는 것만으로 3D 조각 상자가 그려졌다. (3) `Table`이 `aria-sort`를 스크린 리더에만 알리고 눈으로 보는 사용자에게는 정렬 열·방향의 단서를 주지 않았다. (4) 배지 옆에 `IconButton`을 두면 34px 버튼이 28px 배지보다 커서 칩이 하나의 조작 단위로 읽히지 않았다(실측: 배지 안에 넣으면 28px → 44px). `mark`·`fieldset`·`legend`를 `cdt.reset`에서 토큰 팔레트로 정리하고, `[aria-sort]` 값별 글리프(`↕`·`↑`·`↓`)를 `::after`로 그리되 **`content`의 대체 텍스트 문법(`/ ""`)으로 접근성 이름에서 빼며**(없으면 `시퀀스 ↑`로 읽혀 `aria-sort`와 중복된다 — Chromium AX 트리로 실측), 배지 글자 높이에 맞춘 `.cdt-badge__dismiss`를 더했다. **머지 전 검토가 둘을 더 찾았다.** (a) 정렬 글리프가 `::after` `content`로 접근성 이름에 들어가 `시퀀스 ↑`로 읽혔다 — `aria-sort`가 이미 알리는 것을 글자로 한 번 더 읽는 중복이라, `content`의 대체 텍스트 문법(`"↑" / ""`)으로 눈에만 보이게 했다(Chromium AX 트리로 실측·재확인). (b) 같은 레이어에서는 명시성이 이기므로 `.cdt-btn:not(:disabled):hover`(클래스 셋)가 `.cdt-badge__dismiss.cdt-btn`(클래스 둘)이 벗겨 둔 `box-shadow`를 되살려, 마우스를 올리면 18px 원 안에 1px 밝은 선이 생겼다(실측). hover·press 규칙을 명시성 넷으로 더해 그림자만 다시 지웠다 — 배경 변화와 1px 누름 피드백은 어포던스라 남겼다. 회귀 시험 다섯을 더했다 | FR-CSS-002, FR-CMP-004, FR-CMP-005 | CR-037 (사후) | closed |
| DEV-032 | 2026-09-03 | 구현 편차 | 등장 모션이 없는 표면이 다섯이었다. `.cdt-select__content`·`.cdt-tooltip`·`.cdt-menu`·`.cdt-drawer`·`.cdt-banner`에 `transition`·`animation`·`transform-origin`이 0건이라 팝오버 셋은 트리거와 아무 연결 없이 순간 등장하고, Drawer는 가장자리에서 밀려 들어오지 않고 순간 이동하며, Banner는 페이지 중간에 순간 나타났다. Radix가 원점 변수(`--radix-select-content-transform-origin`, `--radix-popper-transform-origin`)를 이미 제공하는데 소스의 `--radix-` 참조가 0건이었다. 팝오버 셋에 `scale(0.97)`+`opacity` 진입과 트리거 기준 원점을, Drawer에 방향별 `translateX(±100%)` 진입을, Banner에 `translateY(-4px)`+`opacity` 마운트 진입을 주고, `data-state`가 있는 넷에는 `--cdt-motion-fast` 퇴장과 감소 모드 `display: none` 탈출구(DEV-030과 같은 방식)를 함께 걸었다. 지속시간은 성격으로 갈랐다 — Select·Menu는 트리거에서 떨어지는 목록이라 `motion.standard`(240ms) 진입에 `motion.fast`(140ms) 퇴장으로 비대칭이고, Tooltip은 작은 팝오버라 양방향 모두 `motion.fast`다(가장 빠른 토큰이라 퇴장을 더 줄일 곳이 없다). 모달은 중앙 등장이라 원점을 주지 않았다. 회귀 시험 셋을 더했다 | FR-CMP-006, FR-CMP-008, FR-CSS-005 | CR-037 (사후) | closed |
| DEV-031 | 2026-09-03 | 구현 편차 | `Meter` 채움이 레이아웃 속성 `inline-size`를 전환했다(`components.css`의 `transition: inline-size var(--cdt-motion-standard), …`). 소스 전체에서 유일한 레이아웃 전환이며 프레임마다 레이아웃·페인트·합성을 유발한다. 소비처 PR Search의 운영 잡 화면은 30초마다 갱신되어 행마다 이 전환이 돌았다. 채움을 폭 100%에 `transform: scaleX(var(--cdt-meter-ratio))`·`transform-origin: left center`로 바꾸고 `transform`만 전환한다. 커스텀 프로퍼티 계약은 그대로이며 가시 폭도 같다(Chromium 실측: 비율 0·0.05·0.5·1에서 현재와 동일). 컴포넌트 레이어의 전환이 레이아웃 속성을 겨누지 않는지 묻는 시험을 더했다 | FR-CMP-008, FR-CSS-005, C-062 Meter | CR-037 (사후) | closed |
| DEV-030 | 2026-09-03 | 구현 편차 | 오버레이 계열에 퇴장이 없었다. `.cdt-overlay`·`.cdt-dialog`는 `[data-state="open"]` 진입 keyframe만 있고 `[data-state="closed"]` 규칙이 0건이라 240ms에 걸쳐 나타난 뒤 한 프레임에 사라졌고, 모바일 스크림은 진입 페이드도 없었다. 진입의 역방향 keyframe을 `--cdt-motion-fast`(140ms)·`forwards`로 닫힘 상태에 걸었다. Radix Presence가 `animationend`를 기다리므로 감소 모드(0s)에서는 이벤트에 기대지 않고 `cdt.base` 축소 블록이 닫힘 상태를 `display: none`으로 두어 즉시 언마운트하게 했다(Chromium에서 실제 Radix Dialog로 실측). 모바일 서랍은 `cdt.component`가 `display: flex`를 선언해 그 탈출구가 닿지 않으므로 퇴장을 두지 않았다. 회귀 시험 셋을 더했다 | FR-CMP-006, FR-CSS-005 | CR-037 (사후) | closed |
| DEV-029 | 2026-09-03 | 구현 편차 | 축소 모드에서 `Spinner` 라벨이 한 번도 드러난 적이 없었다. 노출 규칙(`base.css`, `cdt.base`)은 있었으나 숨김 규칙(`components.css`의 `.cdt-spinner__label { position: absolute; … clip: rect(0, 0, 0, 0) }`)이 더 뒤 레이어 `cdt.component`에 있어 명시도와 무관하게 항상 이겼다(Chromium 실측: 축소 모드에서도 `position: absolute`, 1×1px). `FR-CMP-008` AC-5(Must)가 충족되지 않았고, 문서 e2e의 `toBeVisible()`은 1×1px 상자도 통과시켜 잡지 못했다. `FR-CSS-005` AC-4가 축소 규칙을 `cdt.base`에 묶으므로 숨김 규칙을 `cdt.base`로 옮겨 같은 레이어에서 명시도로 겨루게 했다. **노출만으로는 부족했다**: 라벨이 `position: static`이 되면 `.cdt-spinner`의 고정 24px 그리드에 둘째 항목으로 들어가 svg가 폭 0으로 무너지고 한국어 라벨이 세로로 흘러넘쳤다(`검색 결과를 불러오는 중` → 24×210px, 넘침). 고정 크기를 컨테이너에서 svg로 옮겨(`.cdt-spinner svg`가 `--cdt-spinner-size`를 갖고 `.cdt-spinner`는 내용에 맞춰 자란다) 일반 모드 렌더링은 그대로 두고 축소 모드에서 원 24px·라벨 한 줄이 되게 했다. 축소 모드에서 컨테이너가 커져 뒤 콘텐츠가 밀리는 것은 의도한 동작이다. `ProgressRing`은 영향받지 않는다. 번들 시험 셋과 e2e 계산값 단언을 더했고, 토큰 스펙 §9.3의 `display` 서술을 실제(`position`·`clip`)로 고쳤다. 계획 001 머지 후 검토가 찾았다 | FR-CMP-008 AC-5, FR-CSS-005 AC-4, C-064 Spinner | CR-037 (사후) | closed |
| DEV-028 | 2026-09-03 | 구현 편차 | `Spinner`가 회전하지 않았다. `components.css`의 `animation: cdt-spin var(--cdt-motion-standard) linear infinite`는 토큰이 `240ms cubic-bezier(…)`로 치환된 뒤 이징이 둘이 되어 선언 전체가 무효였다(Chromium 계산값 `animation-name: none`, 실측 2026-09-02). 회전을 거는 시험이 없어 v0.2.0까지 발견되지 않았고, 소비처 PR Search의 로딩 표시 전부가 정지된 호로 보였다. 고쳐도 `240ms`는 초당 4회전이라 상수 운동용 토큰 `motion.spin`(1000ms linear)과 프리미티브 `ease.linear`를 더해 스피너가 그것만 읽게 했다. 감소 모드 재정의와 번들 시험의 토큰 목록에 함께 넣었고, 단축 선언에 이징이 둘 들어가는 것을 막는 시험을 더했다 | FR-CMP-008, FR-CSS-005, C-064 Spinner | CR-037 (사후) | closed |
| DEV-027 | 2026-08-06 | 문서/코드 불일치 | 세 건을 함께 등록한다. (1) `status.neutralEnd`의 CR-006 예외가 원장의 "승인된 제약"으로 남아 있었고, 그 항목 자체가 시인성 불만 시 값 교정 CR을 열라고 지시했다. (2) 토큰 명세 8.4절이 금지하는 조합(`text.faint`/`accent` on `surface.elevated`)이 산문으로만 존재했다. `lint:tokens`의 `text-faint-on-elevated` 규칙은 한 선언 블록에 두 커스텀 프로퍼티가 함께 적힌 경우만 보므로 `input.placeholder`처럼 별칭으로 같은 색에 도달하는 경로를 볼 수 없다. (3) `palette.light.ts`가 `darkPalette.map`으로 파생돼, base에 없는 키로 오타가 나면 override가 조용히 버려지고 토큰이 다크 값을 유지했다. FR-QA-001 테마 계약 검사는 키 집합만 비교하므로 두 테마 모두 통과한다 — 이 패키지의 다른 어떤 검사도 볼 수 없는 유일한 실버그다 | FR-THM-005 AC-6, FR-THM-004, FR-QA-001, CP-042, FP-001, FP-002, WP-007, WP-010, WP-013 | CR-035 | closed |
| DEV-026 | 2026-08-06 | 문서/코드 불일치 | `conductor_product_ia.md`는 W-030을 `/tokens`, W-040을 `/patterns`로 선언하지만 구현은 두 경로를 모두 라우트로 두고 사이드 내비는 `/tokens/reference`·`/guidelines`를 가리켰다. 같은 화면이 두 URL에서 렌더되므로 북마크·검색 색인·`aria-current` 강조가 갈린다. 내비가 가리키는 쪽을 정규 URL로 채택하고 옛 경로는 쿼리스트링 보존 `replace` 리다이렉트로 남겼다. `shell.spec.ts`의 리다이렉트 e2e와 `/tokens?metrics-unavailable` → `/tokens/reference?metrics-unavailable` 보존을 실브라우저로 확인했다 | W-030, W-040, FR-DOC-001, FR-DOC-004, FR-DOC-007, WP-028 | CR-033 | closed |
| DEV-023 | 2026-07-17 | 구현 편차 | version PR #4가 React package.json을 0.1.1로 올리고 CHANGELOG를 생성하며 Changeset을 소비·삭제한 정상 merge SHA `15024d2`에서 Release run 29585593807의 version 잡이 다시 `changeset status --since react@0.1.0`을 실행해 Changeset 누락으로 실패했다. publish job은 실행 전 skip돼 레지스트리 영향은 없었다. Changesets bot 작성자·고정 제목·Changeset 삭제·영향 manifest/CHANGELOG 쌍·그 외 파일 0건을 모두 만족하는 version commit에서는 이미 소비된 변경 이력 검사를 반복하지 않고 수동 publish를 기다린다. 일반 source commit의 누락 게이트는 유지한다 | FR-DX-005, WP-027, JOB-REL-001 | CR-030 | closed |
| DEV-022 | 2026-07-17 | 구현 편차 | `core.autocrlf=true`인 로컬에서 유효한 **warm-icons-agree.md**가 `frontmatter에 영향받는 패키지와 bump 종류가 없다`며 실패했다. Git blob은 LF, 작업 트리는 CRLF였고 검사기의 frontmatter 정규식이 `\n`만 허용한 것이 원인이다. 파싱 전 CRLF와 단독 CR을 LF로 정규화해 같은 내용이 환경에 따라 다른 판정을 받지 않게 했다. 현재 CRLF patch Changeset은 통과하고 Refs 누락 음성 fixture는 기존대로 exit 1을 유지한다 | FR-DX-005, WP-027, JOB-REL-001 | CR-029 | closed |
| DEV-021 | 2026-07-17 | 구현 편차 | main CI run 29582993773의 Node 22 접근성 잡만 라이트 Dialog open에서 `color-contrast` serious를 냈고, 동일 SHA의 PR·Node 20 잡은 통과했다. 아티팩트의 title foreground `#dadee4`는 light 정지 색 `#0c121c`가 배경 `#e4e8ed` 위에 약 4.6% opacity로 합성된 값이어서 `cdt-dialog-enter` 중간 프레임을 감사한 타이밍 경합으로 확정했다. 렌더 뒤 한 animation frame을 보장하고 유한 animation의 `finished`를 기다린 다음 axe를 실행한다. 무한 Spinner는 대기에서만 제외한다. 전체 Chromium 게이트 4회 연속 각 164 passed + 1 skipped로 종결했다 | FR-QA-003, FR-A11Y-005, WP-024, JOB-CI-002 | CR-028 | closed |
| DEV-020 | 2026-07-17 | 문서 오류 | 첫 공개 릴리스 후 운영 문서를 실제 경로와 대조하니 인프라·릴리스 계획에 이전 조직명 `conductor`, 수동 `next` publish·dist-tag 승격 절차, async 문서의 CHANGELOG 생성 시점과 롤백 순서가 남아 있었다. 실제 계약은 org `conductor-by-89soone`, version PR에서 CHANGELOG 생성, 승인 후 OIDC `changeset publish`, deprecate 후 `react → css → tokens` dist-tag 롤백이다. 실제 워크플로·스크립트와 일치하도록 cascade했다 | FR-DX-005, NFR-002, NFR-004, WP-027, JOB-REL-001 | CR-027 | closed |
| DEV-019 | 2026-07-17 | 구현 편차 | 첫 레지스트리 소비자 설치에서 `lucide-react@0.468.0`이 peer 경고를 냈다. manifest의 `^0.400.0`은 semver 0.x에서 `>=0.400.0 <0.401.0`만 허용하지만 저장소 자체가 0.468.0을 개발 의존성으로 사용하고 README는 버전 없이 설치를 안내했다. 컴포넌트는 아이콘을 번들하지 않고 소비자 주입을 받으므로 의도한 호환선을 `>=0.400.0 <2`로 명시하고 patch changeset을 추가했다 | FR-CMP-004, FR-DX-004, WP-011, API-PKG-003 | CR-026 | closed |
| DEV-018 | 2026-07-17 | 구현 편차 | 첫 OIDC publish가 0.1.0 3종과 provenance를 성공적으로 게시했지만 원격 git 태그는 0개였다. `@changesets/git`의 annotated `git tag -m`이 Git identity 부재로 실패했고 CLI가 boolean 실패를 예외로 전파하지 않아 뒤의 `git push --tags`가 `Everything up-to-date`로 성공했다. 태그 3개를 릴리스 SHA에 복구하고, release job에 bot identity와 manifest 버전별 annotated tag·HEAD ancestry·원격 object 일치 게이트를 추가했다 | FR-DX-005, NFR-002, WP-027, JOB-REL-001 | CR-025 | closed |
| DEV-017 | 2026-07-17 | 구현 편차 | CR-023 릴리스 접근성 게이트에서 라이트 테마의 열린 Dialog 닫기 버튼이 axe `color-contrast` serious 위반을 냈다. 명세의 `cdt-dialog__close` 계약과 달리 `Dialog.Close`·`Drawer.Close`가 Radix 원시 버튼을 그대로 내보내 브라우저 기본 ButtonFace/텍스트 색을 사용한 것이 원인이다. 원시 Close에만 기존 secondary compact Button 클래스를 적용하고, `asChild` Button의 variant·size는 보존하도록 수정했다. React 144/144, Chromium 접근성 164 passed + 음성 fixture 1 skipped, visual 27/27, API 리포트 드리프트 0건으로 종결했다 | FR-CMP-006, FR-A11Y-004, FR-QA-003, WP-015, WP-024, WP-026 | CR-024 | closed |
| DEV-016 | 2026-07-15 | 구현 편차 | 보안 아키텍처는 공개 전 저장소 전체 이력의 시크릿 검사를 요구하지만 `scan-secrets.mjs`는 `git ls-files`의 현재 추적 파일만 읽어 삭제된 과거 자격증명과 아직 추적되지 않은 신규 파일을 보지 않았다. `git ls-files --cached --others --exclude-standard`와 `git log --all -p`를 함께 검사하도록 수정했다. 추적·미추적 247개 파일과 실제 Git 이력에서 0건, 합성 PAT fixture 1건은 exit 1로 차단됨을 확인했다 | NFR-002, WP-027, JOB-REL-001 | CR-022 | closed |
| DEV-015 | 2026-07-15 | 기술 제약 | 실제 릴리스 권한 감사에서 npm Trusted Publishing의 현재 최소 조건이 Node 22.14.0/npm 11.5.1인데 release job은 Node 20을 사용함을 확인했다. OIDC publish는 private repository에서도 가능하지만 provenance는 public source에서만 생성되며, 미게시 패키지는 Trusted Publisher 자체를 등록할 수 없다. Node/npm을 지원 버전으로 고정하고 private repository preflight를 추가했다. 최초 1회는 2FA 대화형 인증으로 `bootstrap` dist-tag에 패키지 namespace를 만든 뒤 패키지별 publisher를 등록한다 | FR-DX-005, NFR-002, NFR-004, WP-027, JOB-REL-001 | CR-022 | closed |
| DEV-014 | 2026-07-15 | 구현 편차 | 정적 문서 빌드는 `/` 화면만 프리렌더하지만 `main.tsx`가 `#root`에 자식이 있다는 이유만으로 모든 딥링크에서 `hydrateRoot`를 호출했다. `/components/Button` 등에서는 서버 Overview 트리와 클라이언트 라우트 트리가 달라 React가 셸 전체를 교체하고 hydration 경고·순간 공백을 만들 수 있었다. 루트 URL만 hydrate해 server DOM을 보존하고, 딥링크는 루트 전용 마크업을 제거한 뒤 client mount하도록 경계를 분리했다. 실제 `/` node identity와 딥링크 hydration 경고 0건을 각각 Playwright로 고정했다 | FR-DX-004, FR-DOC-001, WP-018, WP-028 | CR-021 | closed |
| DEV-013 | 2026-07-15 | 문서 오류 | 파생 화면 상태 매트릭스와 QA-193이 `tokens.json` 부재를 FR-DOC-002의 화면 예외로 추가했지만, 최상위 SRS는 토큰 산출물을 필수 빌드 입력으로 규정하고 예외는 용도 설명 누락만 정의한다. 정적 번들에 포함되는 빌드 입력 부재를 런타임 복구 상태로 취급하면 승인되지 않은 요구사항을 발명하게 된다. CR-020으로 해당 상태 행을 제거하고 QA-193을 안정 ID를 보존한 채 폐기했다 | FR-DOC-002, QA-193, W-010~W-014, W-030 | CR-020 | closed |
| DEV-012 | 2026-07-15 | 구현 편차 | 실제 Chromium에서 키보드 포커스된 Button과 TextField가 `:focus-visible`에 일치하지만 계산된 `box-shadow`가 각각 장식용 elevation과 inset highlight만 남고 공통 `focusRing`을 표시하지 않는 것을 확인했다. `cdt.reset`의 전역 포커스 규칙보다 `cdt.component`의 기본 그림자 규칙이 상위 레이어여서 덮어쓴 것이 원인이다. 기존 CSS 테스트는 selector 자체에 `:focus-visible`이 있는 규칙만 검사했고, 브라우저 테스트는 그림자가 `none`이 아닌지만 검사해 장식 그림자를 포커스 표시로 오인했다. shadow-bearing 핵심 컨트롤이 component layer에서 공통 링을 즉시 복원하고 계산값을 정확히 비교하도록 해소했다                                                                                                                                                                                                                                                            | FR-CSS-002, FR-CSS-004, FR-A11Y-001, FR-QA-003, WP-008, WP-012, WP-016, WP-024 | CR-019  | closed |
| DEV-011 | 2026-07-15 | 구현 편차 | CR-018 실제 Chromium 시각 검수에서 세 계약 불일치를 발견했다. (1) 컴포넌트 명세가 Badge·Switch에 요구하는 `--cdt-radius-pill`이 토큰 소스에 없어 CSS 선언이 무효였고 Switch·Meter·마커가 직사각형으로 렌더됐다. (2) `Select.Content`가 `children`을 `RadixSelect.Viewport`에 전달하지 않아 선택 항목과 현재 값이 렌더되지 않았다. (3) `.cdt-btn--tone-accent`가 variant와 같은 채움 규칙에 묶여 Secondary/Ghost accent가 Primary처럼 렌더되고, Ghost danger에 경계가 생겼다. `radius.pill` 복구, Select 자식 전달, variant 우선의 조합 셀렉터로 해소했고 단위·axe·E2E·시각 회귀를 모두 통과했다 | FR-CSS-004, FR-CMP-002, FR-CMP-007, WP-005, WP-012, WP-016, WP-026 | CR-018 | closed |
| DEV-009 | 2026-07-13 | 문서 오류 | WP-028 구현에서 발견. 인프라 운영 §8이 규정한 "커밋 SHA 버전 디렉터리 + 별칭(pointer) 전환 + 직전 5개 보존" 배포 모델을 GitHub Pages가 지원하지 않는다. Pages의 배포 단위는 사이트 스냅샷 전체이며 별칭 전환 API가 없다. CR-016으로 배포를 원자적 스냅샷 교체로, 롤백을 직전 정상 커밋 ref 재배포로 정정했다. §8의 실제 불변식(신·구 자산 혼재 0건)은 그대로 성립한다 | FR-DOC-001, NFR-004, WP-028, JOB-BUILD-004 | CR-016 | closed |
| DEV-010 | 2026-07-13 | 기술 제약 | WP-028 LCP 측정에서 발견. Lighthouse 기본 스로틀(lantern 시뮬레이션)은 프리렌더된 HTML의 첫 페인트를 모델링하지 못해, 프리렌더 전후 모두 LCP를 3,002ms로 예측한다(마크업 4,136자 주입에도 값이 바뀌지 않는다). 같은 스로틀 계수를 실제 Chromium에 적용해 관측하면 1,793ms이며, 마크업만 제거한 동일 번들은 3,580ms로 갈린다. 즉 시뮬레이션 예측은 실제 페인트를 반영하지 못하면서 예산 판정을 뒤집는다. CR-017로 SRS가 명시한 "Fast 3G 스로틀"을 DevTools 프리셋 실측으로 적용하고 두 값을 모두 기록한다 | NFR-001, FR-DOC-001, WP-028 | CR-017 | closed |
| DEV-008 | 2026-07-13 | 기술 제약 | WP-027 구현 검증에서 확인했다. GitHub Actions의 `GITHUB_TOKEN`이 push한 태그는 재귀 방지 정책으로 후속 워크플로를 트리거하지 않아, 문서의 "워크플로가 태그를 생성해 배포 잡을 트리거" 절차가 그대로는 성립하지 않는다. CR-015로 수동 승인(태그 push 또는 workflow_dispatch)과 배포 후 태그 생성으로 정정하고, 배포 명령을 멱등한 `changeset publish`로 바꿨다 | FR-DX-005, NFR-002, WP-027, JOB-REL-001 | CR-015 | closed |
| DEV-007 | 2026-07-12 | 기술 제약 | WP-026 standalone Chromium에서 `prefers-reduced-motion: reduce`가 true인데 Button의 `transition-duration` 계산값이 `0.14s`로 남음을 재현했다. component transition 토큰이 빌드 시 리터럴로 완전 해석되어 live `motion.fast` 재정의를 잃고, `cdt.component` 레이어가 base의 duration 규칙보다 우선한 것이 원인이다. CR-014로 컴포넌트 CSS가 live motion 토큰을 직접 읽도록 하고 감소 모드 토큰 selector 명시도를 보강했다 | FR-CSS-005 AC-1, WP-008, WP-026 | CR-014 | closed |
| DEV-006 | 2026-07-11 | 문서 오류 | C-062의 component token `meter.*`가 FR-TOK-005 semantic `meter` 3개 그룹과 충돌했다. CR-013으로 렌더링 슬롯을 `feedbackMeter.*`로 분리하고 `surface.track`을 semantic track으로 추가해 토큰 빌드를 복구했다 | WP-017, C-062, FR-CMP-008, FR-TOK-005 | CR-013 | closed |
| DEV-005 | 2026-07-11 | 문서 오류 | WP-009 완료 검증 시 발견. 공식 검증 방법이 `pnpm --filter @conductor-by-89soone/css test`만 실행하지만 CSS 테스트는 `packages/css/dist/*.css`를 읽고 빌드를 수행하지 않는다. 따라서 `src/layout.css` 또는 breakpoint 치환 로직을 변경한 뒤 빌드하지 않으면 과거 산출물을 검사해 잘못 통과할 수 있다. 현재 소스와 검사 대상을 일치시키려면 검증 명령에 CSS 빌드가 선행되어야 한다 | WP-009, FR-CSS-003, FR-TOK-009 | CR-012 | closed |
| DEV-004 | 2026-07-11 | 기술 제약 | WP-008 검증 중 발견(WP-008 자체와는 무관하며 CR-009가 세운 CI 단계의 결함이다). `.github/workflows/ci.yml`의 마지막 단계는 토큰 재빌드 후 `git status --porcelain --untracked-files=all`이 비어 있기를 요구한다. 그러나 그보다 앞선 `pnpm install --frozen-lockfile`이 `package.json`의 `bin` 항목(`conductor-build-tokens`·`conductor-check-contrast`·`conductor-lint-tokens`)을 0644 → 0755로 chmod한다. 따라서 이 단계는 **깨끗한 체크아웃에서도 항상 실패**하며, 실패 사유는 토큰 빌드와 무관하다. 실측 재현: `chmod 644 packages/tokens/bin/*.mjs && git status --porcelain packages/tokens/bin/` → 비어 있음. 이어서 `pnpm install --frozen-lockfile` 실행 → 같은 명령이 ` M` 3줄 출력. CI가 아직 한 번도 실행된 적 없어(커밋 2개, 워크플로 실행 0회) 드러나지 않았다 | FR-TOK-001, FR-DX-001 AC-2, WP-001, CR-009 | CR-011 | closed |
| DEV-003 | 2026-07-11 | 문서 오류 | WP-008 착수 시 발견. WP-008의 검증 방법 `pnpm --filter @conductor-by-89soone/css build && pnpm --filter @conductor-by-89soone/css test && pnpm size` 중 두 단계가 실행 불가능하거나 무의미하다. (1) `pnpm size`는 저장소 어디에도 없다. 이 스크립트를 만드는 것은 **WP-025의 구현 범위**이고 WP-025의 선행 WP는 WP-017이므로, WP-008 시점에는 존재할 수 없다. 즉 WP-008은 자신의 검증 명령을 실행할 수 없으면서 그 명령이 수행하는 gzip 20KB 게이트를 DoD로 요구한다. (2) `packages/css`에 `test` 스크립트가 없어 `pnpm --filter @conductor-by-89soone/css test`가 아무것도 실행하지 않고 종료 코드 0을 반환한다(pnpm 10.4.1은 없는 lifecycle 스크립트를 조용히 no-op 처리). 실측: `pnpm --filter @conductor-by-89soone/css test` → exit 0, stdout·stderr 모두 비어 있음. 이는 **절대 실패할 수 없는 검사**이며, CR-009에서 이미 한 번 제거한 결함 유형이다(통과가 보장된 검사는 없는 것보다 나쁘다) | WP-008, WP-025, FR-DX-003 AC-3, NFR-001 | CR-010 | closed |
| DEV-002 | 2026-07-10 | 기술 제약 | WP-003/WP-004 구현 후 발견. `@conductor-by-89soone/tokens`의 공개 타입 표면 일부(`tokens.ts`, `breakpoints.ts`)는 토큰 빌드가 **생성**한다. 그러나 WP-001이 세운 CI 순서는 `install → typecheck → lint → lint:deps → build → test`로, 생성 전에 타입 검사를 돌린다. 생성 파일을 제거하고 `pnpm typecheck`를 실행해 재현했다: `src/index.ts(9,24): error TS2307: Cannot find module './tokens'` 외 3건, 종료 코드 2. 현재 CI가 통과하는 유일한 이유는 생성 파일이 `.gitignore`에 없어 소스 트리에 남기 때문이며, 이는 생성물이 토큰 소스와 어긋날 여지를 만든다(FR-TOK-001의 "토큰 소스가 유일한 입력" 원칙과 충돌) | FR-TOK-006, FR-DX-001 AC-2, FR-TOK-001, WP-001 | CR-009 | closed |
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
| 시각 회귀 검사가 v1 릴리스 게이트에 없었다 (OD-002 종결, CR-005) | REL-001~REL-003 기간에는 M-1을 수동 확인했고, FR-QA-004의 요구사항 상태는 v1 기준 `deferred`로 유지된다 | FR-QA-004(`deferred`), WP-026 | WP-026 완료로 REL-004의 JOB-CI-003이 활성화되어 자동 측정을 시작했다 |
| `text.faint`를 `surface.elevated` 위에 쓸 수 없다 | 대비율 2.94로 비텍스트 3:1에도 미달한다. `pnpm lint:tokens`가 이 조합을 차단한다 | FR-THM-005 AC-3 | 해당 위치에는 `text.muted`(4.76)를 쓴다 |
| ~~다크 테마에서 종료 상태(`status.neutralEnd`) 점이 배경에서 흐리게 읽힌다~~ (CR-006 해소안 A) — **CR-035로 해소됨** | 값 `#475569`를 보존한 대가였다. 2026-08-06 CR-035가 값을 `slate.400`(`#94a3b8`)으로 올려 `badge.marker.background` 위 6.61:1을 확보하고 `usage`를 `nonText`로 되돌렸다. 마커는 링으로 그려 queued의 채운 점과 형태로도 구분된다 | FR-THM-005 AC-6, FR-A11Y-003 | 해소됨 (CP-042로 상시 검사한다) |
| 라이트 테마에서 다크 전용 시각 장치(글래스 배경, 글로우)의 재현 한계(R-1) | 다크 팔레트의 글래스/글로우 효과가 라이트 배경 위에서 판독 불가능할 수 있다 | FR-THM-002 | 판독 불가한 컴포넌트 토큰은 라이트 팔레트에서 solid 대안 값으로 재정의한다. 컴포넌트 코드는 수정하지 않는다 |
| WSL에서 브라우저 런처가 저장소를 오염시킨다 | `chrome-launcher`는 WSL을 감지하면 프로필 경로를 Windows 형식(`C:\...`, `\\wsl.localhost\...`)으로 변환해 리눅스 Chrome에 넘긴다. Chrome은 그 문자열을 통째로 디렉터리 이름 삼아 cwd(=저장소)에 만든다. 측정 1회마다 1개씩 쌓여 64개를 지웠다 | NFR-001, WP-028 | Playwright가 띄운 Chromium에 Lighthouse를 CDP 포트로 붙여 해소했다(`chrome-launcher` 의존성 제거). 브라우저를 새로 붙이는 도구를 추가할 때 실행 후 `git status`로 트리를 확인한다 |
| 소비자 스모크가 CI에 자동화되지 않았다 | workspace 밖 신규 앱에서 tarball 소비에 이어 npm 레지스트리 0.1.0 3종 설치와 `tsc --noEmit`을 통과했다. 실제 설치 경로는 검증됐지만 이 절차 자체는 아직 CI 잡이 아니다 | M-5, FR-DX-002 AC-3, QA-205, WP-028 | 실제 릴리스마다 수동 smoke를 수행한다. 반복 누락이나 회귀가 관찰되면 격리 소비자 CI 잡으로 승격한다 |
| `lint:tokens`의 주석 마스킹이 정규식 리터럴 안의 따옴표에 동기화를 잃는다 | `maskComments`는 문자열만 추적하고 정규식 리터럴을 모른다. `/url\(\s*['"]?.../`처럼 정규식 안에 따옴표가 있으면 그 뒤의 주석이 마스킹되지 않아, 주석에 적은 색·치수가 위반으로 보고된다. 실측: `packages/css/test/bundle.test.ts:114`부터 주석이 마스킹되지 않는다 | FR-TOK-001, WP-006 | 승인된 제약이다. 오탐 방향(누락이 아니라 과검출)이라 안전하며, `cdt-allow-literal`로 우회한다. 정확한 수정은 JS 렉싱이 필요하므로 필요해지면 CR을 연다 |
| 리셋의 `::selection`과 링크 hover 색이 소스와 다르다 | 소스의 `rgba(109,124,255,0.32)`/`#fff`(선택 영역)와 `#aab3ff`(링크 hover)에 대응하는 토큰이 없다. 선택 영역은 `--cdt-accent-glow` + `--cdt-text-primary`로, 링크 hover는 색 변경 대신 `text-decoration: underline`으로 구현했다(어두운 배경에서 accent를 더 어둡게 하면 본문 대비 4.5:1이 깨진다) | FR-CSS-002, G-1, WP-008 | 승인된 제약이다. 정확한 색이 필요하면 토큰을 신설하는 CR을 열어 `packages/tokens`에서 처리한다(코드가 아니라 토큰 소스가 유일한 입력이다) |
| 스크롤바·`sr-only` 치수에 `cdt-allow-literal` 허용 주석 4건이 있다 | `10px`(스크롤바 트랙), `3px`(썸 테두리), `999px`(pill 반경), `1px`/`-1px`(시각적 숨김 상자)는 대응 토큰이 없다. `space` 스케일은 4px에서 시작하고 `radius` 최대값은 24px다 | FR-TOK-001 AC-3, WP-008 | 승인된 제약이다. `pnpm lint:tokens --report`가 4건을 사유와 함께 상시 노출한다 |
| 필터/칩 컴포넌트군(F-CMP-010)이 v1에 없다 | 소비자가 자체 구현한다. FR이 부여되지 않았고 WP도 없다 | OD-003 (open, 비차단) | REL-003 종료 시점에 Product가 결정한다 |

OD-002(시각 회귀 이월)와 OD-004(셸 컴포넌트군 패키지 포함)는 2026-07-10 CR-005로 종결되었다. 더 이상 조건부 제약이 아니다.

## 5.1 승인 대기 항목 (CR 선행 필요)

분석 리포트(APPLY.md) 적용 중 확인된, **승인된 AC가 고정하고 있어 구현하지 않은** 변경이다. 둘 다 코드가 아니라 요구사항의 문제이므로 CR이 선행되어야 한다.

| 항목 | 왜 막혔는가 | 관련 ID | 다음 단계 |
| --- | --- | --- | --- |
| `font.size.2xs` 제거 | 소비처가 0건이지만 FR-TOK-007 AC-1이 "시스템이 노출하는 유일한 7개"로 스케일을 못 박고 있다. 제거하면 6단이 되어 AC와 어긋난다 | FR-TOK-007 AC-1, WP-005 | 제거 여부를 결정하는 CR을 연다. 결정 전까지 문서에는 "예약됨"이 아니라 **"미사용"**으로 표기한다 |
| `StatusBadge`·`SeverityTag`의 `icon`을 선택형으로 완화 | FR-CMP-004 AC-1이 색·아이콘·텍스트 **세 채널 동시 렌더**를 요구하고, 컴포넌트 명세 C-021이 "세 채널 중 어느 하나도 생략할 수 없다"고 못 박는다. `icon`을 생략 가능하게 만들면 Conductor가 아이콘 세트를 번들하지 않으므로 아이콘 채널이 실제로 사라진다 — 접근성 AC를 약화하는 제품 결정이다 | FR-CMP-004 AC-1, FR-A11Y-003, C-021, C-022 | 접근성 AC 완화를 승인하는 CR을 연다. 그 전까지 실질 이득(이름 하드코딩 제거)은 `STATUS_ICONS`/`SEVERITY_ICONS` 배포와 `data-cdt-icon` 노출로 확보한다 |

## 6. 코드 태깅 규약

- **커밋/PR `Refs:` 줄**: `Refs: WP-### FR-<AREA>-###` 형식을 커밋 메시지 또는 PR 본문에 남긴다. 한 WP가 여러 FR을 구현하면 공백으로 나열한다. 예: `Refs: WP-004 FR-TOK-004 FR-TOK-005`.
- **테스트 이름**: 각 테스트 이름 또는 인접 주석이 검증하는 FR과 AC를 `FR-<AREA>-### AC-#: <설명>` 형식으로 포함한다. 예: `FR-CMP-002 AC-2: loading 상태에서 클릭 핸들러가 호출되지 않는다`.
- **모듈 파일 상단 FR 범위 주석**: 각 모듈 파일 상단에 이 파일이 구현하는 FR 범위를 선언한다. TypeScript/TSX는 `// FR 범위: FR-CMP-002`, CSS는 `/* FR 범위: FR-CSS-004 */` 형식을 사용한다.

## 7. 요구사항 정합성 점검

`validate_srs_prd_env.py --root . --report --code-root <repo>` 를 실행하면, 승인된 FR 중 코드에 `Refs:` 태그 또는 FR 범위 주석으로 연결되지 않은 항목(미태깅 요구사항)을 점검할 수 있다. 코딩 에이전트는 WP 완료 시 이 스크립트를 실행하고, 리포트 결과를 §2 WP 상태 표의 검증 결과 열에 기록한다.
